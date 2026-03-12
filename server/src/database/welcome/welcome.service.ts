import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../../storage/database/supabase-client';

@Injectable()
export class WelcomeService {
  private client = getSupabaseClient();

  async getAll() {
    const { data, error } = await this.client
      .from('welcome_messages')
      .select('*')
      .eq('is_active', 'true')
      .order('order', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async create(body: { title: string; content: string; imageUrl?: string; order: string }) {
    const { data, error } = await this.client
      .from('welcome_messages')
      .insert({
        title: body.title,
        content: body.content,
        image_url: body.imageUrl,
        order: body.order,
        is_active: 'true',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, body: { title?: string; content?: string; imageUrl?: string; order?: string; isActive?: string }) {
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data, error } = await this.client
      .from('welcome_messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string) {
    const { data, error } = await this.client
      .from('welcome_messages')
      .update({ is_active: 'false' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
