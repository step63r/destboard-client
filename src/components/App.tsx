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
  TextField,
  Tooltip,
  Typography,
  Paper
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import CircleIcon from '@mui/icons-material/Circle';
import EditIcon from '@mui/icons-material/Edit';


import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { DestBoardCell } from '../types/destBoardCell';

import "./App.css";

const App: React.FC = () => {
  const [table, setTable] = useState<DestBoardCell[][]>([]);
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editCell, setEditCell] = useState<DestBoardCell>({ name: '', status: '', present: false });
  const [editCellPos, setEditCellPos] = useState<[number, number]>([-1, -1]);

  /**
   * componentDidMountに相当
   */
  useEffect(() => {
    updateTable();
    setDate(new Date());
  }, []);

  const handleTogglePresent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, row: number, col: number) => {
    e.preventDefault();
    postRequest(row, col, undefined, undefined, !table[col][row].present);
  };

  /**
   * 行先編集ボタンのイベントハンドラ
   * @param e 
   * @param row 
   * @param col 
   */
  const handleEditButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, row: number, col: number) => {
    e.preventDefault();
    setEditCell({ ...table[col][row] });
    setEditCellPos([row, col]);
    setIsEdit(true);
  };

  /**
   * 行先が編集されたときのイベントハンドラ
   * @param e 
   */
  const handleChangeStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditCell({ ...editCell, status: e.target.value });
  };

  /**
   * 行先更新ボタンのイベントハンドラ
   * @param e 
   * @param row 
   * @param col 
   */
  const handleSubmitUpdateStatusButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, row: number, col: number) => {
    e.preventDefault();
    postRequest(row, col, undefined, editCell.status, undefined);
    setEditCell({ name: '', status: '', present: false });
    setEditCellPos([-1, -1]);
    setIsEdit(false);
  };

  /**
   * 行先編集キャンセルボタンのイベントハンドラ
   * @param e 
   */
  const handleCancelUpdateStatusButton = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setEditCell({ name: '', status: '', present: false });
    setEditCellPos([-1, -1]);
    setIsEdit(false);
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
          setDate(new Date());
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
   * @param col 列番号
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
      .then((_: AxiosResponse<any>) => {
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
          最終更新：{date.toLocaleString()}
        </Typography>

        <Stack direction='row' spacing={2}>
          {table.map((col, idx) => (
            <TableContainer key={idx} component={Paper}>
              <Table sx={{ minWidth: 300 }}>
                <colgroup>
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '80%' }} />
                  <col style={{ width: 'auto' }} />
                </colgroup>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>名前</TableCell>
                    <TableCell>行先</TableCell>
                    <TableCell></TableCell>
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
                      <TableCell>
                        {isEdit && editCellPos[0] === idx2 && editCellPos[1] === idx
                          ? (
                            <Stack direction='row'>
                              <TextField variant='standard' value={editCell.status} onChange={handleChangeStatus} hiddenLabel fullWidth />
                              <Tooltip title="更新">
                                <IconButton onClick={(e) => handleSubmitUpdateStatusButton(e, idx2, idx)}>
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="キャンセル">
                                <IconButton onClick={handleCancelUpdateStatusButton}>
                                  <ClearIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )
                          : `${row.status}`}
                      </TableCell>
                      <TableCell>
                        {!isEdit && (
                          <Tooltip title="行先を編集">
                            <IconButton onClick={(e) => handleEditButton(e, idx2, idx)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
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
