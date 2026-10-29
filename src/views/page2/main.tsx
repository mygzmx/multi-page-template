import React from "react";
import { createRoot } from 'react-dom/client';
import Page2 from "@/views/page2";

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Page2 />
  </React.StrictMode>
);
