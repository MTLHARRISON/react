import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = 'https://app.atera.com/api/v3/tickets?itemsInPage=50';
const FETCH_INTERVAL = 15 * 60 * 1000; // 15 minutes

function App() {
  const [ticketData, setTicketData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchTickets = async (url = API_URL, allTickets = []) => {
    try {
      const response = await axios.get(url, {
        headers: {
          'X-Api-Key': '9da6118557df451f8044edbb2fe3b3e5' // ⚠️ API key exposed in frontend!
        }
      });

      const { items, nextLink } = response.data;
      allTickets = [...allTickets, ...items];

      if (nextLink) {
        return fetchTickets(nextLink, allTickets);
      } else {
        return allTickets;
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      return [];
    }
  };

  const processTicketData = (tickets) => {
    const technicianCounts = {};

    tickets.forEach(ticket => {
      if (ticket.Status === 'Open') {
        const name = ticket.TechnicianFullName || 'Unassigned';
        technicianCounts[name] = (technicianCounts[name] || 0) + 1;
      }
    });

    return technicianCounts;
  };

  const loadData = async () => {
    setLoading(true);
    const allTickets = await fetchTickets();
    const processed = processTicketData(allTickets);
    setTicketData(processed);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: Object.keys(ticketData),
    datasets: [
      {
        label: 'Open Tickets',
        data: Object.values(ticketData),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  };

  return (
    <div style={{ width: '80%', margin: 'auto', paddingTop: '40px' }}>
      <h2>Open Tickets by Technician</h2>
      {loading ? <p>Loading...</p> : <Bar data={chartData} />}
    </div>
  );
}

export default App;
