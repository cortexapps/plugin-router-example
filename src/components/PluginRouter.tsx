import React, { ReactNode, useEffect, useMemo } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

export interface ParentRoutingSyncOptions {
  mode?: 'hash' | 'query';
  queryParamKey?: string;
}

/**
 * Custom hook that synchronizes the in-app route with the parent page’s URL.
 */
export const useParentRoutingSync = (
  options: ParentRoutingSyncOptions = { mode: 'hash', queryParamKey: 'pluginRoute' }
): void => {
  const { mode, queryParamKey } = options;
  const location = useLocation();

  useEffect(() => {
    if (window.parent && window.parent !== window) {
      if (mode === 'hash') {
        const newHash = `#${location.pathname}${location.search}${location.hash}`;
        try {
          window.parent.history.replaceState(null, '', newHash);
        } catch (error) {
          console.error('Error updating parent hash:', error);
        }
      } else if (mode === 'query') {
        try {
          const parentUrl = new URL(window.parent.location.href);
          const newRoute = `${location.pathname}${location.search}${location.hash}`;
          parentUrl.searchParams.set(queryParamKey!, newRoute);
          window.parent.history.replaceState(null, '', parentUrl.toString());
        } catch (error) {
          console.error('Error updating parent query param:', error);
        }
      }
    }
  }, [location, mode, queryParamKey]);
};

interface ParentRouterSyncProps {
  options?: ParentRoutingSyncOptions;
}

/**
 * Helper component to invoke the URL sync hook.
 */
const ParentRouterSync: React.FC<ParentRouterSyncProps> = ({ options }) => {
  useParentRoutingSync(options);
  return null;
};

interface PluginRouterProps {
  children: ReactNode;
  initialEntries?: string[];
  syncOptions?: ParentRoutingSyncOptions;
}

/**
 * PluginRouter wraps your app's routing logic and sets the initial route
 * based on the parent page’s URL if no initial route is provided.
 */
export const PluginRouter: React.FC<PluginRouterProps> = ({
  children,
  initialEntries,
  syncOptions = { mode: 'hash', queryParamKey: 'pluginRoute' },
}) => {
  const defaultInitialEntries = useMemo((): string[] => {
    // If initialEntries are provided, use them
    if (initialEntries && initialEntries.length > 0) {
      return initialEntries;
    }
    let route = '/';
    try {
      if (window.parent && window.parent !== window) {
        if (syncOptions.mode === 'query') {
          const parentUrl = new URL(window.parent.location.href);
          route = parentUrl.searchParams.get(syncOptions.queryParamKey || 'pluginRoute') || '/';
        } else if (syncOptions.mode === 'hash') {
          const parentHash = window.parent.location.hash;
          route = parentHash ? parentHash.slice(1) : '/';
        }
      }
    } catch (error) {
      console.error('Error reading parent URL for initial route:', error);
    }
    return [route];
  }, [initialEntries, syncOptions]);

  return (
    <MemoryRouter initialEntries={defaultInitialEntries}>
      <ParentRouterSync options={syncOptions} />
      {children}
    </MemoryRouter>
  );
};
