import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

app.post('/api/submit-form', async (req, res) => {
  try {
    const { name, email, phone, address, message } = req.body;

    const { data, error } = await supabase
      .from('form_submissions')
      .insert([
        {
          name,
          email,
          phone,
          address,
          message
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Form submitted successfully',
      data
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting form',
      error: error.message
    });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
