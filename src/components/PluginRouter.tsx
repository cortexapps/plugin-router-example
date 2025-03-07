import React, { ReactNode, useEffect } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

export interface ParentRoutingSyncOptions {
  mode?: 'hash' | 'query';
  queryParamKey?: string;
}

/**
 * Custom hook that synchronizes the in-app route with the parent page’s URL.
 * Updates the parent's URL either via the hash or a query parameter.
 *
 * @param options Configuration options for syncing.
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
 * A helper component that uses the above hook to perform URL synchronization.
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
 * PluginRouter is a wrapper around react-router’s MemoryRouter that:
 * - Keeps the plugin routing internal (in-memory).
 * - Syncs route changes to the parent page (using hash or query parameters).
 *
 * @param children The routed components.
 * @param initialEntries Optional initial routes for the MemoryRouter.
 * @param syncOptions Options for URL synchronization.
 */
export const PluginRouter: React.FC<PluginRouterProps> = ({
  children,
  initialEntries,
  syncOptions = { mode: 'hash', queryParamKey: 'pluginRoute' },
}) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ParentRouterSync options={syncOptions} />
      {children}
    </MemoryRouter>
  );
};
