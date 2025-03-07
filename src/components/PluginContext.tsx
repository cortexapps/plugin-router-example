import { Input, Title } from "@cortexapps/plugin-core/components";
import { useState, useEffect } from "react";
import type React from "react";

const PluginContext: React.FC = () => {
  // const context = usePluginContext();

  const [queryParams, setQueryParams] = useState<any>();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setQueryParams(searchParams.get("query"));
  }, []);

  useEffect(() => {
    if (queryParams?.query) {
      const url = new URL(window.parent.location.href);
      url.searchParams.set("query", queryParams.query);
      window.parent.history.pushState({}, "", url.toString());
    }
  }, [queryParams]);

  return (
    <>
      <Title level={2}>Query params</Title>
      <pre>{JSON.stringify(queryParams, null, 2)}</pre>
      <Input
        value={queryParams?.query || ""}
        onChange={(e) => {
          setQueryParams({query: e.target.value});
        }}
      />
    </>
  );
};

export default PluginContext;
