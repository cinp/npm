/*
 * CInP react client
 * version 0.9
 * for CInP API version 0.9
 *
 * Copyright Peter Howe, Floyd Arguello
 * Released under the Apache 2.0 license
 *
 * Last modified 2021-11-24
 */


declare type Paramater
{
  type: string;
  is_array: boolean;
  choice_list: string[];
  default: any;
  length: number;
  model: string;
  allowed_scheme_list: string[];
}

declare type Describe
{
  type: string;
  name: string;
  doc: string;
  path: string;
  // NameSpace
  version: string;
  multi_uri_max: number;
  namespace_list: string[];
  model_list: string[];
  // Model
  constant_list: string[];
  field_list: string[];
  action_list: string[];
  not_allowed_verbs: string[];
  list_filter_list: string[];
  // Action
  return_type: string;
  static: boolean;
  paramaters: Paramater[];
}

declare type Get
{
  data: any[];
  multiObject: boolean;
}

declare type Create
{
  data: any[];
  id: string;
}

declare type Update
{
  data: any[];
  multiObject: boolean;
}

declare type List
{
  data: any[];
  position: number;
  count: number;
  total: number;
}

declare type Call
{
  data: any[];
  multiObject: boolean;
}

delcare class CInP 
{
  constructor( host: string );
  
  setAuth( usename: string, token: string ): void;
  describe( uri: string ): Promise<Describe>;
  get( id: string, force_multi_mode: boolean ): Promise<Get>;
  create( uri: string, values: Object ): Promise<Create>;
  update( uri: string, values: Object, force_multi_mode: boolean ): Promise<Update>;
  delete( uri: string ): Promise<boolean>;
  list( uri: string, filter_name: string, filter_value_map: Object, position: number, count:number ): Promise<List>;
  call( uri: string, paramater_map: Object, force_multi_mode: boolean ): Promise<Call>;
  
  splitURI( uri: string ): string[];
  getMulti( uri: string, id_list: string[], chunk_size: number ): string[];
  extractIds( uri_list: string[] ): string[];
  getFilteredObjects( uri: string, filter_name: string, filter_value_map: Object, list_chunk_size: number, get_chunk_size: number );
}

