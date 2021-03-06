/*
 * CInP react client
 * version 0.9.1
 * for CInP API version 0.9
 *
 * Copyright Peter Howe, Floyd Arguello
 * Released under the Apache 2.0 license
 *
 * Last modified 2021-12-18
 */

export type uri = string;

export type Paramater = {
  type: string;
  is_array: boolean;
  choice_list: string[];
  default: unknown;
  length: number;
  model: string;
  allowed_scheme_list: string[];
}

export type Describe = {
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

export type Create<T> = {
  data: T;
  id: string;
}

export type List = {
  data: uri[];
  position: number;
  count: number;
  total: number;
}

export class CInP {
  private host: string;
  private headers: Record<string, string>;
  public server_error_handler: ( header: string, detail: string ) => void;
  public using_cookies: boolean;
  constructor( host: string );

  setHeader( name: string, value: string ): void;

  raw( verb: string, uri: string, data: object, header_map: Record<string, string> ): Promise<unknown>;

  describe( uri: uri ): Promise<Describe>;
  get<T>( id: uri ): Promise<T[]>;
  getOne<T>( id: uri ): Promise<T>;
  create<T>( uri: uri, values: Record<string, unknown> ): Promise<Create<T>>;
  update<T>( uri: uri, values: Record<string, unknown> ): Promise<T[]>;
  updateOne<T>( uri: uri, values: Record<string, unknown> ): Promise<T>;
  delete( uri: uri ): Promise<boolean>;
  list( uri: uri, filter_name?: string, filter_value_map?: Record<string, unknown>, position?: number, count? :number ): Promise<List>;
  call( uri: uri, paramater_map: unknown ): Promise<unknown[]>;
  callOne( uri: uri, paramater_map: unknown ): Promise<unknown>;

  splitURI( uri: uri ): string[];
  getMulti<T>( uri: uri, id_list: string[] ): Promise<Record<uri, T>>;
  extractIds( uri_list: uri[] ): string[];
  getFilteredObjects<T>( uri: string, filter_name?: string, filter_value_map?: Record<string, unknown>, position?: number, count? :number ): Promise<Record<uri, T>>;
}

export default CInP;
