import { NextResponse } from 'next/server';
import { query } from 'lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM fighter_details');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Error fetching data from the database' }, { status: 500 });
  }
}
