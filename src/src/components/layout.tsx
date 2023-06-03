import { AmplifyUser } from '@aws-amplify/ui';
import { AppBar, Box, Button, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { Auth } from "aws-amplify";
import { Outlet, useNavigate } from "react-router-dom";
import GraphQLAPI, { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import LogoutIcon from '@mui/icons-material/Logout';
import TocIcon from '@mui/icons-material/Toc';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';

interface IProps {
    auth: (typeof Auth);
    user: AmplifyUser;
}

const drawerWidth = 240;

const Layout = (props: IProps): JSX.Element => {

    const navigate = useNavigate();

    function addBooking() {
        GraphQLAPI.graphql(
            {
                query: 'mutation AddBooking { addBooking(end_date: 10, roomid: "a", start_date: 10) { id } }',
                authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            }
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Book-a-hytte
                    </Typography>
                    <Button
                        color="error"
                        onClick={
                            () => {
                                props.auth.signOut()
                            }
                        }
                        variant="contained"
                    >
                        <LogoutIcon />
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem key='Home' disablePadding>
                            <ListItemButton onClick={() => navigate('/')} >
                                <ListItemIcon>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary='Home' />
                            </ListItemButton>
                        </ListItem>
                        <ListItem key='Bookings' disablePadding>
                            <ListItemButton onClick={() => navigate('/bookings')} >
                                <ListItemIcon>
                                    <TocIcon />
                                </ListItemIcon>
                                <ListItemText primary='Bookings' />
                            </ListItemButton>
                        </ListItem>
                        <ListItem key='New booking...' disablePadding>
                            <ListItemButton onClick={() => addBooking()} >
                                <ListItemIcon>
                                    <AddIcon />
                                </ListItemIcon>
                                <ListItemText primary='New booking...' />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}

export default Layout;
