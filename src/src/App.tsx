import './App.css';
import {
    Auth,
} from 'aws-amplify';
import { createTheme, ThemeProvider } from '@mui/material';
import { useEffect, useState } from 'react';
import { AmplifyUser } from '@aws-amplify/ui';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/layout';
import SignIn from './pages/signin';
import Home from './pages/home';

interface IProps {
    auth: (typeof Auth);
}

const App = (props: IProps): JSX.Element => {

    const [user, setUser] = useState<AmplifyUser | undefined | null>();

    const defaultTheme = createTheme();

    //  Hydrate user
    useEffect(() => {
        props.auth.currentAuthenticatedUser()
            .then((user) => {

                //  Inspect groups
                if ('cognito:groups' in user.signInUserSession.idToken.payload) {
                }

                // Set user identity
                setUser(user);

                // Deal with refresh token
                props.auth.currentSession();
            })
            .catch(
                () => {
                    setUser(null);
                }
            );

    }, [props.auth]);

    return (
        <ThemeProvider theme={defaultTheme}>
            <BrowserRouter>
                <Routes>
                    {
                        user &&
                        <Route path="/*" element={
                            <Layout auth={props.auth} user={user} />
                        }>

                            <Route path="*" element={
                                <Home auth={props.auth} user={user} />
                            }>
                            </Route>
                        </Route>
                    }
                    {
                        !user &&
                        <Route path="/*" element={
                            <SignIn auth={props.auth} user={user} />
                        } />
                    }

                </Routes>
            </BrowserRouter>
        </ThemeProvider >
    );
}

export default App;
