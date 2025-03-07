import type React from "react";
import { useEffect, useState } from "react";

import { PluginRouter } from './PluginRouter';
import { Routes, Route, Link, Navigate } from 'react-router-dom';

import { PluginProvider } from "@cortexapps/plugin-core/components";
import "../baseStyles.css";
import ErrorBoundary from "./ErrorBoundary";

const Home: React.FC = () => <div className="page-container"><div className="page-content">Home Page</div></div>;
const Page1: React.FC = () => <div className="page-container"><div className="page-content">Page 1</div></div>;
const Page2: React.FC = () => <div className="page-container"><div className="page-content">Page 2</div></div>;

const App: React.FC = () => {
  const [queryParams, setQueryParams] = useState<any>();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.parent.location.search);
    setQueryParams(Object.fromEntries(searchParams.entries()));
  }, []);

  useEffect(() => {
    if (queryParams?.query) {
      const url = new URL(window.parent.location.href);
      url.searchParams.set("query", queryParams.query);
      window.parent.history.replaceState({}, "", url.toString());
    }
  }, [queryParams]);

  return (
    <ErrorBoundary>
      <PluginRouter
        syncOptions={{ mode: "query", queryParamKey: "pluginRoute" }}
      >
        <PluginProvider>
          <nav className="top-nav">
            <Link className="nav-link" to="/">Home</Link>
            <Link className="nav-link" to="/page1">Page 1</Link>
            <Link className="nav-link" to="/page2">Page 2</Link>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/page1" element={<Page1 />} />
            <Route path="/page2" element={<Page2 />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PluginProvider>
      </PluginRouter>
    </ErrorBoundary>
  );
};

export default App;
