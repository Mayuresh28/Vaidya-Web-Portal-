export async function GET(request) {
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/n4l8iuoqbpra4';
    const url = new URL(request.url);
    const doctor = url.searchParams.get('doctor'); // Get the 'doctor' query parameter
  
    try {
      const response = await fetch(SHEETDB_URL);
      const data = await response.json();
  
      // If a doctor is specified, filter the data
      const filteredData = doctor 
        ? data.filter((appointment) => appointment.Doctor === doctor)
        : data;
  
      return new Response(JSON.stringify(filteredData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  
  export async function POST(request) {
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/n4l8iuoqbpra4';
    const body = await request.json();
  
    try {
      const response = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [body] }),
      });
  
      if (!response.ok) throw new Error('Failed to add data');
  
      return new Response(JSON.stringify({ message: 'Data added successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to add data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  