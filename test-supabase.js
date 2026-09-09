import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dcdwryioyskqmbafdrvt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZHdyeWlveXNrcW1iYWZkcnZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDU3NTUsImV4cCI6MjEwNDUyMTc1NX0.vRZ1y8NMfE5kX23eeP6oS4yvHHBj6ORj_J-neWpRhV4'
)

async function testInsert() {
  const { data, error } = await supabase.from('product_requests').insert({
    customer_name: 'Test',
    customer_contact: '123456',
    product_name: 'Test Product'
  })
  
  if (error) {
    console.error('ERROR:', error)
  } else {
    console.log('SUCCESS:', data)
  }
}

testInsert()
