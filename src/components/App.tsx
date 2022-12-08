import React, { useEffect, useState } from 'react';
import {
  Grid,
  Stack,
  Typography
} from '@mui/material';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { DestBoardCell } from '../types/destBoardCell';

const options: AxiosRequestConfig = {
  url: "http://127.0.0.1:8000/",
  method: "GET",
};

const App: React.FC = () => {
  const [table, setTable] = useState<DestBoardCell[][]>([]);

  useEffect(() => {
    (async () => {
      axios(options)
        .then((res: AxiosResponse<DestBoardCell[][]>) => {
          if (res.data) {
            setTable(transpose(res.data));
          }
        })
        .catch((e: AxiosError<{ error: string }>) => {
          console.log(e.message);
        });
    })();
  });

  const transpose = (src: DestBoardCell[][]): DestBoardCell[][] => {
    return src[0].map((_, c) => src.map(r => r[c]));
  };

  return (
    <Stack spacing={2} direction='column' margin={4}>
      <Typography variant='h3' component='div' gutterBottom>
        行先表示板
      </Typography>

      <Grid container spacing={2} direction='row'>
        {table.map((row) => (
          <Grid container item spacing={1} direction='column'>
            {row.map((cell) => (
              <Grid container item spacing={1}>
                <Grid item>{cell.name}</Grid>
                <Grid item>{cell.status}</Grid>
                <Grid item>{cell.present.toString()}</Grid>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default App;
