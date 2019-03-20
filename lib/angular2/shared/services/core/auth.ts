/* tslint:disable */
declare var Object: any;
import { Injectable, Inject } from '@angular/core';
import { InternalStorage } from '../../storage/storage.swaps';
import { SDKToken } from '../../models/BaseModels';
import { LoopBackConfig } from "../../lb.config";

/**
* @author Jonathan Casarrubias <twitter:@johncasarrubias> <github:@mean-expert-official>
* @module SocketConnection
* @license MIT
* @description
* This module handle socket connections and return singleton instances for each
* connection, it will use the SDK Socket Driver Available currently supporting
* Angular 2 for web, NativeScript 2 and Angular Universal.
**/
@Injectable()
export class LoopBackAuth {
  /**
   * @type {SDKToken}
   **/
  private token: SDKToken = new SDKToken();

  /**
   * @method constructor
   * @param {InternalStorage} storage Internal Storage Driver
   * @description
   * The constructor will initialize the token loading data from storage
   **/
  constructor(@Inject(InternalStorage) protected storage: InternalStorage) {
    this.token.id = this.load(LoopBackConfig.getTokenIdStorageKey());
    this.token.user = this.load(LoopBackConfig.getUserStorageKey());
    this.token.userId = this.load(LoopBackConfig.getUserIdStorageKey());
    this.token.created = this.load(LoopBackConfig.getCreatedStorageKey());
    this.token.ttl = this.load(LoopBackConfig.getTtlStorageKey());
    this.token.rememberMe = this.load(LoopBackConfig.getRememberMeStorageKey());
  }
  /**
   * @method setRememberMe
   * @param {boolean} value Flag to remember credentials
   * @return {void}
   * @description
   * This method will set a flag in order to remember the current credentials
   **/
  public setRememberMe(value: boolean): void {
    this.token.rememberMe = value;
  }
  /**
   * @method setUser
   * @param {any} user Any type of user model
   * @return {void}
   * @description
   * This method will update the user information and persist it if the
   * rememberMe flag is set.
   **/
  public setUser(user: any) {
    this.token.user = user;
    this.save();
  }
  /**
   * @method setToken
   * @param {SDKToken} token SDKToken or casted AccessToken instance
   * @return {void}
   * @description
   * This method will set a flag in order to remember the current credentials
   **/
  public setToken(token: SDKToken): void {
    this.token = Object.assign({}, this.token, token);
    this.save();
  }
  /**
   * @method getToken
   * @return {void}
   * @description
   * This method will set a flag in order to remember the current credentials.
   **/
  public getToken(): SDKToken {
    return <SDKToken>this.token;
  }
  /**
   * @method getAccessTokenId
   * @return {string}
   * @description
   * This method will return the actual token string, not the object instance.
   **/
  public getAccessTokenId(): string {
    return this.token.id;
  }
  /**
   * @method getCurrentUserId
   * @return {any}
   * @description
   * This method will return the current user id, it can be number or string.
   **/
  public getCurrentUserId(): any {
    return this.token.userId;
  }
  /**
   * @method getCurrentUserData
   * @return {any}
   * @description
   * This method will return the current user instance.
   **/
  public getCurrentUserData(): any {
    return (typeof this.token.user === 'string') ? JSON.parse(this.token.user) : this.token.user;
  }
  /**
   * @method save
   * @return {boolean} Whether or not the information was saved
   * @description
   * This method will save in either local storage or cookies the current credentials.
   * But only if rememberMe is enabled.
   **/
  public save(): boolean {
      let today = new Date();
      let expires = new Date(today.getTime() + (this.token.ttl * 1000));
      this.persist(LoopBackConfig.getTokenIdStorageKey(), this.token.id, expires);
      this.persist(LoopBackConfig.getUserStorageKey(), this.token.user, expires);
      this.persist(LoopBackConfig.getUserIdStorageKey(), this.token.userId, expires);
      this.persist(LoopBackConfig.getCreatedStorageKey(), this.token.created, expires);
      this.persist(LoopBackConfig.getTtlStorageKey(), this.token.ttl, expires);
      this.persist(LoopBackConfig.getRememberMeStorageKey(), this.token.rememberMe, expires);
      return true;
  };
  /**
   * @method load
   * @param {string} prop Property name
   * @return {any} Any information persisted in storage
   * @description
   * This method will load either from local storage or cookies the provided property.
   **/
  protected load(prop: string): any {
    return this.storage.get(`${LoopBackConfig.getStorageKeyPrefix()}${prop}`);
  }
  /**
   * @method clear
   * @return {void}
   * @description
   * This method will clear cookies or the local storage.
   **/
  public clear(): void {
    Object.keys(this.token).forEach((prop: string) => this.storage.remove(`${LoopBackConfig.getStorageKeyPrefix()}${prop}`));
    this.token = new SDKToken();
  }
  /**
   * @method persist
   * @return {void}
   * @description
   * This method saves values to storage
   **/
  protected persist(prop: string, value: any, expires?: Date): void {
    try {
      if (prop === 'user' && value && value.csvDelimiter) {
          value.csvDelimiter = escape(value.csvDelimiter);
      }
      this.storage.set(
        `${LoopBackConfig.getStorageKeyPrefix()}${prop}`,
        (typeof value === 'object') ? JSON.stringify(value) : value,
        this.token.rememberMe?expires:null
      );
    }
    catch (err) {
      console.error('Cannot access local/session storage:', err);
    }
  }
}
