"use strict"
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

const uriRegex = /^(\/([a-zA-Z0-9\-_.!~*]+\/)*)([a-zA-Z0-9\-_.!~*]+)?(:([a-zA-Z0-9\-_.!~*']*:)*)?(\([a-zA-Z0-9\-_.!~*]+\))?$/;

class CInP
{
  constructor( host )
  {
    this.host = host;
    this.auth_id = null;
    this.auth_token = null;
    this.server_error_handler = null;
  }

  _request( verb, uri, data, header_map )
  {
    if( this.auth_id !== null )
    {
      header_map = Object.assign( {}, header_map, { 'Auth-Id': this.auth_id, 'Auth-Token': this.auth_token } );
    }

    const encodedData = JSON.stringify( data );
    const request = {
      method: verb,
      headers: Object.assign( {}, header_map, {
                                                'Accept': 'application/json',
                                                'CInP-Version': '0.9'
                                              } )
    };

    if( encodedData !== undefined )
    {
      request.headers[ 'Content-Length' ] = encodedData.length.toString();
      request.headers[ 'Content-Type' ] = 'application/json';
      request.body = encodedData;
    }

    return new Promise( ( resolve, reject ) =>
    {
      fetch( this.host + uri, request ).then(
        ( response ) =>
        {
          if ( response.status < 200 || response.status >= 300 )
          {
            this._request_fail( verb, uri, reject, response );
          }
          else
          {
            if( response.headers.get( 'Content-Length' ) === "0" )
              resolve( { data: {}, status: response.status, headers: response.headers } );
            else
              response.json().then( ( data ) => resolve( { data: data, status: response.status, headers: response.headers } ),
                                    ( error ) => this._request_fail( verb, uri, reject, error ) );
          }
        },
        ( error ) =>
        {
          this._request_fail( verb, uri, reject, error );
        }
      ).catch( ( err ) =>
        {
          console.error( 'cinp: error handeling result: "'+ err + '"' );
          reject( { msg: 'Error handeling response' } );
        } )
    } );
  }

  _request_fail( verb, uri, reject, response )
  {
    if( !( response instanceof Response ) )
    {
      console.error( 'cinp: doing "' + verb + '" on "' +  uri + '" Error: ' + response );
      reject( { msg: 'Error "' + response + '"' } );
      return;
    }

    console.error( 'cinp: doing "' + verb + '" on "' +  uri + '" Status: ' + response.status );

    response.text().then( ( value ) => this._request_fail_inner( response, value, reject ) );
  }

  _request_fail_inner( response, data, reject )
  {
    try
    {
      data = JSON.parse( data );
    }
    finally
    {
      // nothing
    }

    if( response.status === 400 )
    {
      if( typeof data === 'object' )
      {
        if( 'message' in data )
        {
          reject( { msg: 'Invalid Request', detail: data.message } );
        }
        else
        {
          reject( { msg: 'Invalid Request', detail: data } );
        }
      }
      else
      {
        reject( { msg: 'Invalid Request', detail: data } );
      }
    }
    else if( response.status === 401 )
    {
      reject( { msg: 'Invalid Session' } );
    }
    else if( response.status === 403 )
    {
      reject( { msg: 'Not Authorized' } );
    }
    else if( response.status === 404 )
    {
      reject( { msg: 'Not Found' } );
    }
    else if( response.status === 500 )
    {
      if( typeof data === 'object' )
      {
        reject( { msg: 'Server Error', detail: data.message, trace: data.trace } );
      }
      else
      {
        reject( { msg: 'Server Error', detail: data } );
      }
    }
    else
    {
      reject( { detail: data } );
    }
  }

  setAuth( auth_id, auth_token )
  {
    if( auth_token === undefined || auth_token === '' )
    {
      this.auth_id = null;
      this.auth_token = null;
    }
    else
    {
      this.auth_id = auth_id;
      this.auth_token = auth_token;
    }
  }

  isAuthencated()
  {
    return( this.auth_token !== null )
  }

  describe( uri )
  {
    return this._request( 'DESCRIBE', uri )
      .then( ( result ) =>
        {
          const type = result.headers.get( 'Type' );
          const data = result.data;

          if( type === 'Namespace' )
          {
            return( { type: 'namespace', name: data.name, doc: data.doc, path: data.path, version: data[ 'api-version' ], multi_uri_max: parseInt( data[ 'multi-uri-max' ] ), namespace_list: data.namespaces, model_list: data.models } );
          }
          else if( type === 'Model' )
          {
            return( { type: 'model', name: data.name, doc: data.doc, path: data.path, constant_list: data.constants, field_list: data.fields, action_list: data.actions, not_allowed_verbs: data[ 'not-allowed-methods' ], list_filter_list: data[ 'list-filters' ] } );
          }
          else if( type === 'Action' )
          {
            let paramaters = data.paramaters;
            for ( const paramater of paramaters )
            {
              if( Object.prototype.hasOwnProperty.call( paramater, 'length' ) )
              {
                paramater.length = parseInt( paramater.length );
              }
            }
            return( { type: 'model', name: data.name, doc: data.doc, path: data.path, return_type: data[ 'return-type' ], static: data.static, paramaters: paramaters } );
          }
          else
          {
            console.warn( 'cinp: Unknown type in Discover response "' + type + '"' );
            return( {} );
          }
        }
      );
  }

  getOne( uri )
  {
    return this._request( 'GET', uri, undefined, { 'Multi-Object': false } )
      .then( ( result ) =>
        {
          return result.data;
        }
      );
  }

  get( uri )
  {
    return this._request( 'GET', uri, undefined, { 'Multi-Object': true } )
      .then( ( result ) =>
        {
          return result.data;
        }
      );
  }

  create( uri, values )
  {
    return this._request( 'CREATE', uri, values )
      .then( ( result ) =>
        {
          return( { data: result.data, id: result.headers.get( 'Object-Id' ) } );
        }
      );
  }

  update( uri, values, force_multi_mode=false )
  {
    force_multi_mode = ( typeof force_multi_mode !== 'undefined' ) ? force_multi_mode : false;

    return this._request( 'UPDATE', uri, values, { 'Multi-Object': force_multi_mode } )
     .then( ( result ) =>
        {
          return( { data: result.data, multiObject: result.headers.get( 'Multi-Object' ).toUpperCase() === 'TRUE' } );
        }
      );
  }

  delete( uri )
  {
    return this._request( 'DELETE', uri )
      .then( () =>
        {
          return( true );
        }
      );
  }

  list( uri, filter_name=undefined, filter_value_map={}, position=undefined, count=undefined )
  {
    const header_map = {};
    if ( typeof filter_name !== 'undefined' )
      header_map[ 'Filter' ] = filter_name;

    if ( typeof position !== 'undefined' )
      header_map[ 'Position' ] = position;

    if ( typeof count !== 'undefined' )
      header_map[ 'Count' ] = count;

    filter_value_map = ( typeof filter_value_map !== 'undefined' ) ? filter_value_map : {};

    return this._request( 'LIST', uri, filter_value_map, header_map )
      .then( ( result ) =>
        {
          return( { data: result.data, position: parseInt( result.headers.get( 'Position' ) ), count: parseInt( result.headers.get( 'Count' ) ), total: parseInt( result.headers.get( 'Total' ) ) } );
        }
      );
  }

  call( uri, paramater_map, force_multi_mode=false )
  {
    force_multi_mode = ( typeof force_multi_mode !== 'undefined' ) ? force_multi_mode : false;

    return this._request( 'CALL', uri, paramater_map, { 'Multi-Object': force_multi_mode } )
      .then( ( result ) =>
        {
          return( { data: result.data, multiObject: result.headers.get( 'Multi-Object' ).toUpperCase() === 'TRUE' } );
        }
      )
  }

  splitURI( uri )
  {
    const parts = uriRegex.exec( uri );

    const result = { namespace: parts[1], model: parts[3], action: undefined, id_list: undefined }
    if( parts[6] !== undefined )
    {
      result.action = parts[6].substring( 1, parts[6].length -1  )
    }
    if( parts[4] !== undefined )
    {
      result.id_list = parts[4].split( ':' ).slice( 1, -1 );
    }

    return result;
  }

  getMulti( uri, id_list )
  {
    const uri_parts = this.splitURI( uri );

    if( id_list.length === 0 )
    {
      return new Promise( ( resolve ) => resolve( {} ) );
    }
    else
    {
      return this.get( uri_parts.namespace + uri_parts.model + ':' + id_list.join( ':' ) + ':', true );
    }
  }

  extractIds( uri_list )
  {
    var result = [];
    if( !Array.isArray( uri_list ) )
    {
      uri_list = [ uri_list ];
    }

    for( var uri of uri_list )
    {
      if( uri === undefined || uri === null )
        continue;

      var parts = uriRegex.exec( uri );
      if( parts[4] === undefined )
      {
        continue;
      }

      result = result.concat( parts[4].split( ':' ).slice( 1, -1 ) );
    }

    return result;
  }

  getFilteredObjects( uri, filter_name, filter_value_map, position=undefined, count=undefined )
  {
    return this.list( uri, filter_name, filter_value_map, position, count )
      .then( ( result ) =>
      {
        const id_list = this.extractIds( result.data );

        return this.getMulti( uri, id_list );
      } );
  }
}

export default CInP;
