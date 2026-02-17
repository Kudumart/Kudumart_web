import React from 'react';
import AdminEnd from "../../../components/SubLevel";

const data = [
    { id: 1, name: 'Benjamn Franklin', email: 'testmail@gmail.com', phone: '0700 000 0000', dateJoined: '30-10-24', status: 'Suspended' },
    { id: 2, name: 'Daniel Ameachi', email: 'testmail@gmail.com', phone: '0800 000 0000', dateJoined: '30-10-24', status: 'Active' },
    { id: 3, name: 'Francias Muller', email: 'testmail@gmail.com', phone: '0700 000 0000', dateJoined: '30-10-24', status: 'Active' },
    { id: 4, name: 'Zuko Tariq', email: 'testmail@gmail.com', phone: '0800 000 0000', dateJoined: '30-10-24', status: 'Active' },
    { id: 5, name: 'Benjamin Frank', email: 'testmail@gmail.com', phone: '0700 000 0000', dateJoined: '30-10-24', status: 'Active' },
    { id: 6, name: 'Azuko Bent', email: 'testmail@gmail.com', phone: '0900 000 0000', dateJoined: '30-10-24', status: 'In Active' },
];

const App = () => {

    return (
        <div className="min-h-screen">
            <AdminEnd data={data} />
        </div>
    );
};

export default App;
