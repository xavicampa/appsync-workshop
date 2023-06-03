import { AmplifyUser } from "@aws-amplify/ui";
import { Auth } from "aws-amplify";
import { useEffect, useState } from "react";
import GraphQLAPI, { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { Box, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

interface IProps {
    auth: (typeof Auth);
    user: AmplifyUser;
}

const Rooms = (_props: IProps): JSX.Element => {

    const [rooms, setRooms] = useState<any[]>([]);

    async function fetchRooms() {
        const response = await GraphQLAPI.graphql(
            {
                query: 'query ListRooms { listRooms { id, beds, price } }',
                authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
            }
        ) as GraphQLResult<any>;

        setRooms(response.data?.listRooms);
    }

    useEffect(() => {

        //  update list of rooms
        fetchRooms();

    }, []);

    //  DEBUG
    // useEffect(() => {
    //     console.log(rooms);
    // }, [rooms]);

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Rooms
                </Typography>
                {
                    rooms && rooms.length > 0 &&
                    <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Id</TableCell>
                                    <TableCell align="right">Beds</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    rooms.map((room) => (
                                        <TableRow
                                            key={room.id}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                {room.id}
                                            </TableCell>
                                            <TableCell align="right">{room.beds}</TableCell>
                                            <TableCell align="right">{room.price}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                }
                {
                    (!rooms || rooms.length === 0) &&
                    <Typography variant="h5" component="h1" gutterBottom>
                        No rooms!
                    </Typography>
                }
            </Box>
        </Container>
    );

}

export default Rooms;
