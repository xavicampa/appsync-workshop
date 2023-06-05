import { AmplifyUser } from '@aws-amplify/ui';
import { AppBar, Box, Button, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { Auth } from "aws-amplify";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
import TocIcon from '@mui/icons-material/Toc';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import BedIcon from '@mui/icons-material/Bed';
import { useState } from 'react';
import NewBooking from '../components/new_booking';

interface IProps {
    auth: (typeof Auth);
    user: AmplifyUser;
}

const drawerWidth = 240;

const Layout = (props: IProps): JSX.Element => {

    const location = useLocation();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Book-a-room</Typography>
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
                            <ListItemButton
                                onClick={() => navigate('/')}
                                selected={location.pathname === '/'}
                            >
                                <ListItemIcon>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary='Home' />
                            </ListItemButton>
                        </ListItem>
                        <ListItem key='Rooms' disablePadding>
                            <ListItemButton
                                onClick={() => navigate('/rooms')}
                                selected={location.pathname === '/rooms'}
                            >
                                <ListItemIcon>
                                    <BedIcon />
                                </ListItemIcon>
                                <ListItemText primary='Rooms' />
                            </ListItemButton>
                        </ListItem>
                        <ListItem key='Bookings' disablePadding>
                            <ListItemButton
                                onClick={() => navigate('/bookings')}
                                selected={location.pathname === '/bookings'}
                            >
                                <ListItemIcon>
                                    <TocIcon />
                                </ListItemIcon>
                                <ListItemText primary='Bookings' />
                            </ListItemButton>
                        </ListItem>
                        <ListItem key='New booking...' disablePadding>
                            <ListItemButton
                                onClick={handleOpen}
                                selected={location.pathname === '/new'}
                            >
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

            <NewBooking auth={props.auth} user={props.user} open={open} setOpen={setOpen} />
        </Box>
    );
}

export default Layout;
