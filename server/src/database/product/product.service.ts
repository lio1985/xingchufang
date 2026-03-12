import { Injectable } from '@nestjs/common'
import { getSupabaseClient } from '../../storage/database/supabase-client'

@Injectable()
export class ProductService {
  private client = getSupabaseClient()

  async findAll() {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }

  async findOne(id: string) {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async create(data: { name: string; category?: string; description?: string }) {
    const { data: result, error } = await this.client
      .from('products')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return result
  }

  async update(id: string, data: { name?: string; category?: string; description?: string }) {
    const { data: result, error } = await this.client
      .from('products')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return result
  }

  async delete(id: string) {
    const { error } = await this.client
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}
