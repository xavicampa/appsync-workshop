import { Button, Container, Dialog, DialogActions, DialogTitle, Stack, Typography } from "@mui/material";
import GraphQLAPI, { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { Auth } from "aws-amplify";
import { AmplifyUser } from '@aws-amplify/ui';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";

interface IProps {
    auth: (typeof Auth);
    user: AmplifyUser;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewBooking = (props: IProps): JSX.Element => {

    const [rooms, setRooms] = useState<any[]>();
    const [selectedRoom, setSelectedRoom] = useState<Number | null>(null);
    const [selectedStartDate, setSelectedStartDate] = useState<Number | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Number | null>(null);

    useEffect(() => {
        if (props.open)
            fetchRooms();
    }, [props.open]);

    // //DEBUG
    // useEffect(() => {
    //     console.log(selectedRoom);
    //     console.log(selectedStartDate);
    //     console.log(selectedEndDate);
    // }, [selectedRoom, selectedStartDate, selectedEndDate]);

    const handleClose = () => {
        setSelectedRoom(null);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        props.setOpen(false);
    };

    async function fetchRooms() {
        const response = await GraphQLAPI.graphql(
            {
                query: 'query ListRooms { listRooms { id, beds, price } }',
                authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            }
        ) as GraphQLResult<any>;
        setRooms(response.data?.listRooms);
    }

    function addBooking() {
        (GraphQLAPI.graphql(
            {
                query: `mutation AddBooking($roomid:ID!,$start_date:String!,$end_date:String!) {
                            addBooking(roomid: $roomid, start_date: $start_date, end_date: $end_date) {
                                id
                            }
                        }`,
                authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
                variables: {
                    roomid: selectedRoom,
                    start_date: selectedStartDate,
                    end_date: selectedEndDate
                }
            }
        ) as Promise<GraphQLResult<any>>)
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                handleClose();
            });
    }

    return (
        <Dialog
            maxWidth="md"
            onClose={handleClose}
            open={props.open}
        >
            <Container>
                <DialogTitle>New booking</DialogTitle>
                <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="center"
                    spacing={2}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Check-in"
                            onChange={(value: any) => setSelectedStartDate(value)}
                            value={selectedStartDate}
                        />
                        <DatePicker
                            label="Check-out"
                            onChange={(value: any) => setSelectedEndDate(value)}
                            value={selectedEndDate}
                        />
                    </LocalizationProvider>
                </Stack>
                <Container
                    sx={{ padding: 2 }}
                >
                    <Typography>Room</Typography>
                    <Stack
                        direction="row"
                        spacing={2}
                    >
                        {
                            rooms && rooms.length > 0 && rooms.map((room) => (
                                <Button
                                    key={room.id}
                                    onClick={() => setSelectedRoom(room.id)}
                                    variant={selectedRoom === room.id ? "contained" : "outlined"}
                                >
                                    {room.id}
                                </Button>
                            ))
                        }
                    </Stack>
                </Container>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={addBooking} variant='contained'>Book</Button>
                </DialogActions>
            </Container>
        </Dialog>
    );
}

export default NewBooking;
