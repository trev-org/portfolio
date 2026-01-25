"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/login.module.css";
import Link from "next/link";
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js'
import { createAuth0Client, Auth0Client, User as Auth0User } from '@auth0/auth0-spa-js'

const Login: React.FC = () => {
  const [auth0Client, setAuth0Client] = useState<Auth0Client | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<Auth0User | null>(null);

  useEffect(() => {
    const initClients = async () => {
      const auth0 = await createAuth0Client({
        domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
        clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
        authorizationParams: {
          redirect_uri: "https://docs.rovert.io/",
        },
      });
      setAuth0Client(auth0);

      console.log('Current URL:', window.location.href);
      console.log('Search params:', window.location.search);

      if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
        console.log('Handling redirect callback...');
        await auth0.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const isAuthenticated = await auth0.isAuthenticated();
      console.log('Is authenticated:', isAuthenticated);
      
      if (isAuthenticated) {
        const user = await auth0.getUser();
        console.log('User from Auth0:', user);
        setUser(user || null);
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          accessToken: async () => {
            const accessToken = await auth0.getTokenSilently();
            return accessToken;
          },
        }
      );
      setSupabaseClient(supabase);
    };

    initClients();
  }, []);

  const handleLogin = async () => {
    if (!auth0Client) return;
    await auth0Client.loginWithRedirect();
  };

  const handleLogout = async () => {
    if (!auth0Client) return;
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  };

  return (
    <div className={styles.scheduleContain}>
      <div className={styles.brandingContain}>
        <div className={styles.brandingHeader}>
          <Link className={styles.name} href="/">
            {user ? "Signed in" : "Log In"}
          </Link>
        </div>
        <div className={styles.introContain}>
          <p className={styles.intro}>
            Log in to access the full benefits of Trevor.
          </p>
        </div>
      </div>
      <div className={styles.contentContain}>
        {user ? (
          <button onClick={handleLogout}>Sign Out</button>
        ) : (
          <button onClick={handleLogin}>Log In</button>
        )}
      </div>
    </div>
  );
};

export default Login;
