import { AmplifyUser } from "@aws-amplify/ui";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import GraphQLAPI, { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Observable, Subscription } from "rxjs";
import DeleteIcon from '@mui/icons-material/Delete';

interface IProps {
    auth: (typeof Auth);
    user: AmplifyUser;
}

async function subscribeToBookingUpdates(): Promise<GraphQLResult<any> | Observable<GraphQLResult<any>>> {
    return (await GraphQLAPI.graphql(
        {
            query: 'subscription onBookingUpdates { onBookingUpdates { id } }',
            authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        }
    ) as GraphQLResult<any>);
}

const Bookings = (_props: IProps): JSX.Element => {

    const [bookings, setBookings] = useState<any[]>([]);

    async function removeBooking(guest: string, id: string) {
        const response = await GraphQLAPI.graphql(
            {
                query: 'mutation RemoveBooking($guest:ID!,$id:ID!) { removeBooking(guest:$guest,id:$id) { id } }',
                authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
                variables: { id: id, guest: guest }
            }
        ) as GraphQLResult<any>;

        setBookings(response.data?.removeBooking);
    }
    async function fetchBookings() {
        const response = await GraphQLAPI.graphql(
            {
                query: 'query ListBookings { listBookings { guest, id, start_date, end_date, roomid } }',
                authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            }
        ) as GraphQLResult<any>;

        setBookings(response.data?.listBookings);
    }

    useEffect(() => {

        //  update list of bookings
        fetchBookings();

        //  subscribe to updates
        let bookingsSubscription: Subscription;
        subscribeToBookingUpdates()
            .then(subscription => {
                bookingsSubscription = (subscription as Observable<GraphQLResult>).subscribe(
                    {
                        next: fetchBookings,
                        error: response => { console.log(response) }
                    }
                );
            }
            )
            .catch(error => { console.log(error) });

        //  unsubscribe when leaving the page
        return () => {
            bookingsSubscription?.unsubscribe();
        }

    }, []);

    //  DEBUG
    // useEffect(() => {
    //     console.log(bookings);
    // }, [bookings]);

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bookings
                </Typography>
                {
                    bookings && bookings.length > 0 &&
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Guest</TableCell>
                                    <TableCell align="right">Room</TableCell>
                                    <TableCell align="right">Check-in</TableCell>
                                    <TableCell align="right">Check-out</TableCell>
                                    <TableCell align="right"></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    bookings.map((booking) => (
                                        <TableRow
                                            key={booking.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {booking.guest}
                                            </TableCell>
                                            <TableCell align="right">{booking.roomid}</TableCell>
                                            <TableCell align="right">{booking.start_date}</TableCell>
                                            <TableCell align="right">{booking.end_date}</TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    color="error"
                                                    onClick={
                                                        () => {
                                                            removeBooking(booking.guest, booking.id)
                                                        }
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }
                {
                    (!bookings || bookings.length === 0) &&
                    <Typography variant="h5" component="h1" gutterBottom>
                        No bookings!
                    </Typography>
                }
            </Box>
        </Container>
    );

}

export default Bookings;
