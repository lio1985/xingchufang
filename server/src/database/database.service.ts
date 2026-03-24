import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '../storage/database/supabase-client';

@Injectable()
export class DatabaseService {
  private client = getSupabaseClient();

  getClient() {
    return this.client;
  }
}
