import React from "react";
import { createRoot } from 'react-dom/client';
import Page1 from "@/views/page1";

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Page1 />
  </React.StrictMode>
);
