import { AmplifyUser } from "@aws-amplify/ui";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import GraphQLAPI, { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { Box, Container, Typography } from "@mui/material";
import { Observable, Subscription } from "rxjs";

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

    async function fetchBookings() {
        const response = await GraphQLAPI.graphql(
            {
                query: 'query listBookings { listBookings { id } }',
                authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            }
        ) as GraphQLResult<any>;

        setBookings(response.data.listBookings);
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
    useEffect(() => {
        console.log(bookings);
    }, [bookings]);

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bookings!
                </Typography>
            </Box>
        </Container>
    );

}

export default Bookings;
