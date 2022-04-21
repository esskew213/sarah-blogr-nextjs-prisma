// when the page depends on the user who is authenticated,
// it can't be statically generated. Rather, use server-side rendering
// with getServerSideProps

import React from 'react';
import { GetServerSideProps } from 'next';
// PROTECT CLIENT SIDE WITH USESESSION, SERVER SIDE WITH GETSESSION
// getSession returns a promise with a session object, or null if no session exists
// useSession is  the easiest way to check if someone is signed in.
// returns an object containing two values: data and status:
////// data: This can be three values: Session / undefined / null.
////// when the session hasn't been fetched yet, data will undefined
////// in case it failed to retrieve the session, data will be null
////// in case of success, data will be Session.
// status: enum mapping to three possible session states: "loading" | "authenticated" | "unauthenticated"
// https://next-auth.js.org/getting-started/client for more details
import { useSession, getSession } from 'next-auth/react';
import Layout from '../components/Layout';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  // protecting server side with getSession
  const session = await getSession({ req });
  if (!session) {
    res.statusCode = 403;
    return { props: { drafts: [] } };
  }

  // drafts are retrieved from DB during server-side rendering, then made available to the React component with props
  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
      published: false,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
  });
  return {
    props: { drafts },
  };
};

type Props = {
  drafts: PostProps[];
};

const Drafts: React.FC<Props> = (props) => {
  // protecting client side with useSession
  const { data: session } = useSession();

  if (!session) {
    return (
      <Layout>
        <h1>My Drafts</h1>
        <div>You need to be authenticated to view this page.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='page'>
        <h1>My Drafts</h1>
        <main>
          {props.drafts.map((post) => (
            <div key={post.id} className='post'>
              <Post post={post} />
            </div>
          ))}
        </main>
      </div>
      <style jsx>{`
        .post {
          background: var(--geist-background);
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  );
};

export default Drafts;
