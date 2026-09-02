import { TestBed } from '@angular/core/testing';
import { supabase } from './supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

describe('Supabase', () => {
  let service: SupabaseClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
