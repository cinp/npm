/*
 * CInP react client
 * version 2.0.0
 * for CInP API version 2.0
 *
 * Copyright Peter Howe, Floyd Arguello
 * Released under the Apache 2.0 license
 */

export type uri = string;

export type Parameter = {
  type: string;
  is_array: boolean;
  choice_list: string[];
  default: unknown;
  length: number;
  model: string;
  allowed_scheme_list: string[];
}

export type URIParts = {
  namespace: string;
  model: string;
  action: string | undefined;
  id_list: string[] | undefined;
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
  not_allowed_verb_list: string[];
  list_filter_list: string[];
  query_filter_field_list: string[];
  query_sort_field_list: string[];
  // Action
  return_type: string;
  static: boolean;
  parameters: Parameter[];
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
  clearHeader( name: string ): void;

  raw( verb: string, uri: string, data: object, header_map: Record<string, string> ): Promise<unknown>;

  describe( uri: uri ): Promise<Describe>;
  get<T>( id: uri ): Promise<T[]>;
  getOne<T>( id: uri ): Promise<T>;
  create<T>( uri: uri, values: Record<string, unknown> ): Promise<Create<T>>;
  update<T>( uri: uri, values: Record<string, unknown> ): Promise<T[]>;
  updateOne<T>( uri: uri, values: Record<string, unknown> ): Promise<T>;
  delete( uri: uri ): Promise<boolean>;
  list( uri: uri, filter_name?: string, filter_value_map?: Record<string, unknown>, position?: number, count? :number ): Promise<List>;
  call( uri: uri, parameter_map: unknown ): Promise<unknown[]>;
  callOne( uri: uri, parameter_map: unknown ): Promise<unknown>;

  splitURI( uri: uri ): URIParts;
  getMulti<T>( uri: uri, id_list: string[] ): Promise<Record<uri, T>>;
  extractIds( uri_list: uri[] ): string[];
  getFilteredObjects<T>( uri: string, filter_name?: string, filter_value_map?: Record<string, unknown>, position?: number, count? :number ): Promise<Record<uri, T>>;
}

export default CInP;
