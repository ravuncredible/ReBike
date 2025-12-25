// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// เอา URL และ Key จาก Supabase Dashboard > Project Settings > API
const supabaseUrl = 'https://uxsnhvcpjkrpthubiytx.supabase.co' 
const supabaseAnonKey = 'sb_publishable_OOvGSm9ZeSeVKdTlCceE7A_K_yFRKmb' 

// สร้าง Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions สำหรับ Auth
export const auth = {
  // Sign up
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // เก็บข้อมูลเพิ่มเติม เช่น name, phone
      }
    })
    return { data, error }
  },

  // Sign in
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Helper functions สำหรับ Database
export const db = {
  // Get data
  get: async (table, query = {}) => {
    let request = supabase.from(table).select(query.select || '*')
    
    if (query.eq) {
      Object.entries(query.eq).forEach(([key, value]) => {
        request = request.eq(key, value)
      })
    }
    
    if (query.order) {
      request = request.order(query.order.column, { ascending: query.order.ascending !== false })
    }
    
    if (query.limit) {
      request = request.limit(query.limit)
    }
    
    const { data, error } = await request
    return { data, error }
  },

  // Insert data
  insert: async (table, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    return { data: result, error }
  },

  // Update data
  update: async (table, id, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
    return { data: result, error }
  },

  // Delete data
  delete: async (table, id) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Helper functions สำหรับ Storage
export const storage = {
  // Upload file
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    return { data, error }
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Delete file
  delete: async (bucket, paths) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)
    return { data, error }
  }
}
