/* eslint-disable */
/**
 * @fileoverview gRPC-Web generated client stub for protobuf
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.protobuf = require('./invoice_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.protobuf.InvoiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.protobuf.InvoicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.protobuf.InvoiceRequest,
 *   !proto.protobuf.InvoiceResponse>}
 */
const methodInfo_Invoice_CreateInvoice = new grpc.web.AbstractClientBase.MethodInfo(
  proto.protobuf.InvoiceResponse,
  /** @param {!proto.protobuf.InvoiceRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.protobuf.InvoiceResponse.deserializeBinary
);


/**
 * @param {!proto.protobuf.InvoiceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.protobuf.InvoiceResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.protobuf.InvoiceResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.protobuf.InvoiceClient.prototype.createInvoice =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/protobuf.Invoice/CreateInvoice',
      request,
      metadata || {},
      methodInfo_Invoice_CreateInvoice,
      callback);
};


/**
 * @param {!proto.protobuf.InvoiceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.protobuf.InvoiceResponse>}
 *     A native promise that resolves to the response
 */
proto.protobuf.InvoicePromiseClient.prototype.createInvoice =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/protobuf.Invoice/CreateInvoice',
      request,
      metadata || {},
      methodInfo_Invoice_CreateInvoice);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.protobuf.InvoiceGetRequest,
 *   !proto.protobuf.InvoiceResponse>}
 */
const methodInfo_Invoice_GetInvoice = new grpc.web.AbstractClientBase.MethodInfo(
  proto.protobuf.InvoiceResponse,
  /** @param {!proto.protobuf.InvoiceGetRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.protobuf.InvoiceResponse.deserializeBinary
);


/**
 * @param {!proto.protobuf.InvoiceGetRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.protobuf.InvoiceResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.protobuf.InvoiceResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.protobuf.InvoiceClient.prototype.getInvoice =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/protobuf.Invoice/GetInvoice',
      request,
      metadata || {},
      methodInfo_Invoice_GetInvoice,
      callback);
};


/**
 * @param {!proto.protobuf.InvoiceGetRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.protobuf.InvoiceResponse>}
 *     A native promise that resolves to the response
 */
proto.protobuf.InvoicePromiseClient.prototype.getInvoice =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/protobuf.Invoice/GetInvoice',
      request,
      metadata || {},
      methodInfo_Invoice_GetInvoice);
};


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.protobuf.InvoiceCheckRequest,
 *   !proto.protobuf.InvoiceCheckResponse>}
 */
const methodInfo_Invoice_CheckInvoice = new grpc.web.AbstractClientBase.MethodInfo(
  proto.protobuf.InvoiceCheckResponse,
  /** @param {!proto.protobuf.InvoiceCheckRequest} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.protobuf.InvoiceCheckResponse.deserializeBinary
);


/**
 * @param {!proto.protobuf.InvoiceCheckRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.protobuf.InvoiceCheckResponse)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.protobuf.InvoiceCheckResponse>|undefined}
 *     The XHR Node Readable Stream
 */
proto.protobuf.InvoiceClient.prototype.checkInvoice =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/protobuf.Invoice/CheckInvoice',
      request,
      metadata || {},
      methodInfo_Invoice_CheckInvoice,
      callback);
};


/**
 * @param {!proto.protobuf.InvoiceCheckRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.protobuf.InvoiceCheckResponse>}
 *     A native promise that resolves to the response
 */
proto.protobuf.InvoicePromiseClient.prototype.checkInvoice =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/protobuf.Invoice/CheckInvoice',
      request,
      metadata || {},
      methodInfo_Invoice_CheckInvoice);
};


module.exports = proto.protobuf;

