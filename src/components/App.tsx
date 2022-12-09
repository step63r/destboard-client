import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { DestBoardCell } from '../types/destBoardCell';

import "./App.css";

const App: React.FC = () => {
  const [table, setTable] = useState<DestBoardCell[][]>([]);
  const [inProgress, setInProgress] = useState<boolean>(false);

  /**
   * componentDidMountに相当
   */
  useEffect(() => {
    updateTable();
  }, []);

  /**
   * テーブルの行列を反転する
   * @param src テーブル
   * @returns 行列を反転したテーブル
   */
  const transpose = (src: DestBoardCell[][]): DestBoardCell[][] => {
    return src[0].map((_, c) => src.map(r => r[c]));
  };

  const handleTogglePresent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, row: number, col: number) => {
    e.preventDefault();
    postRequest(row, col, undefined, undefined, !table[col][row].present);
  };

  /**
   * テーブル情報の取得
   */
  const updateTable = () => {
    const options: AxiosRequestConfig = {
      url: "http://127.0.0.1:8000/",
      method: "GET",
    };

    axios(options)
      .then((res: AxiosResponse<DestBoardCell[][]>) => {
        if (res.data) {
          console.log('update table success!');
          console.log(res.data);
          setTable(res.data);
        }
      })
      .catch((e: AxiosError<{ error: string }>) => {
        alert("取得に失敗しました。");
        console.log(e.message);
      });
  };

  /**
   * テーブル情報の更新
   * @param row 行番号
   * @param col 列番頭
   * @param name 名前（更新しない場合は undefined を渡す）
   * @param status 行先（更新しない場合は undefined を渡す）
   * @param present 在席状態（更新しない場合は undefined を渡す）
   */
  const postRequest = (row: number, col: number, name: string | undefined, status: string | undefined, present: boolean | undefined) => {
    setInProgress(true);

    const options: AxiosRequestConfig = {
      url: `http://127.0.0.1:8000/${col}/${row}`,
      method: "POST",
      data: {
        "name": name,
        "status": status,
        "present": present,
      }
    };

    axios(options)
      .then((res: AxiosResponse<any>) => {
        console.log('post success!');
        updateTable();
      })
      .catch((e: AxiosError<{ error: string }>) => {
        alert("更新に失敗しました。");
        console.log(e.message);
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  return (
    <>
      <Stack spacing={2} direction='column' margin={4}>
        <Typography variant='h3' component='div' gutterBottom>
          行先表示板
        </Typography>
        <Typography variant='h6' component='div' gutterBottom>
          最終更新：{new Date().toLocaleString()}
        </Typography>

        <Stack direction='row' spacing={2}>
          {table.map((col, idx) => (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 300 }}>
                <colgroup>
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '80%' }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>名前</TableCell>
                    <TableCell>行先</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {col.map((row, idx2) => (
                    <TableRow key={idx2} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <IconButton onClick={(e) => handleTogglePresent(e, idx2, idx)}>
                          <CircleIcon color={row.name !== '' && row.present ? 'success' : 'disabled'} />
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ))}
        </Stack>
      </Stack>
      {inProgress && (
        <div id="overlay">
          <CircularProgress />
        </div>
      )}
      
    </>
  );
}

export default App;
