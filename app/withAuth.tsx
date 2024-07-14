import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByID } from './neo4j.actions';
import React from 'react';
import { Neo4JUser } from '@/types';

const authenticateUser = async () => {
    const { isAuthenticated, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
        return { redirectUrl: '/api/auth/login?post_login_redirect_url=http://localhost:3000/callback' };
    }

    const user = await getUser();

    if (!user) {
        return { redirectUrl: '/api/auth/login?post_login_redirect_url=http://localhost:3000/callback' };
    }

    const currentUser = await getUserByID(user.id);

    return { currentUser };
};

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
        const AuthWrapper = async () => {
            const { redirectUrl, currentUser } = await authenticateUser();

            if (redirectUrl) {
                redirect(redirectUrl);
                return null;
            }

            if (!currentUser) {
                redirect('/api/auth/login?post_login_redirect_url=http://localhost:3000/callback');
                return null;
            }

            if (currentUser.gender === 2 || currentUser.preference === 2) {
                redirect('/profile');
                return null;
            }

            return <WrappedComponent {...props} currentUser={currentUser} />;
        };

        return <AuthWrapper />;
    };
};

export default withAuth;