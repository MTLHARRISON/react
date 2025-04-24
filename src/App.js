import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const API_KEY = '9da6118557df451f8044edbb2fe3b3e5';
const API_URL = 'https://app.atera.com/api/v3/tickets';

const fetchTickets = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'X-API-KEY': API_KEY,
    },
  });
  const data = await response.json();
  return data;
};

const processTicketData = (tickets) => {
  const result = {};

  tickets.forEach((ticket) => {
    const { TechnicianFullName, Status } = ticket;

    if (!['Open', 'Pending'].includes(Status)) return;

    if (!result[TechnicianFullName]) {
      result[TechnicianFullName] = { name: TechnicianFullName, Open: 0, Pending: 0 };
    }
    result[TechnicianFullName][Status] += 1;
  });

  return Object.values(result);
};

export default function TicketDashboard() {
  const [ticketData, setTicketData] = useState([]);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = await fetchTickets();
        const processedData = processTicketData(data);
        setTicketData(processedData);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }
    };

    loadTickets();
    const interval = setInterval(loadTickets, 30000); // refresh every 30 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Atera Ticket Overview</h1>
      <Card>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ticketData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Open" fill="#8884d8" />
              <Bar dataKey="Pending" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </main>
  );
}
