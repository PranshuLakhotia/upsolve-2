import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Page from './Page';
import './index.css' 

const theme = createTheme({
  // Customize your theme here
});

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <Page />
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

