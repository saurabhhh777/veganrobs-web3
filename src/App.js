import React from "react";
import ThemeConfig from "./Theme";
import Router from "./router";
import { Toaster } from "react-hot-toast";

class App extends React.Component {
  render() {
    return (
      <ThemeConfig>
        <Router />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
            error: {
              duration: 4000,
              theme: {
                primary: '#ff4b4b',
              },
            },
          }}
        />
      </ThemeConfig>
    );
  }
}

export default App;
