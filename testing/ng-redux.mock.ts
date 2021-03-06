import {
  NgRedux,
  Selector,
  Comparator,
  ObservableStore,
  PathSelector,
} from '@angular-redux/store';
import { Reducer, Action, Dispatch, Middleware, Store, StoreEnhancer } from 'redux';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/distinctUntilChanged';
import { MockObservableStore } from './observable-store.mock';

/**
 * Convenience mock to make it easier to control selector
 * behaviour in unit tests.
 */
export class MockNgRedux extends NgRedux<any> {
  /** @deprecated Use MockNgRedux.getInstance() instead. */
  static mockInstance?: MockNgRedux = undefined;

  private mockRootStore = new MockObservableStore<any>();

  /**
   * Returns a subject that's connected to any observable returned by the
   * given selector. You can use this subject to pump values into your
   * components or services under test; when they call .select or @select
   * in the context of a unit test, MockNgRedux will give them the values
   * you pushed onto your stub.
   */
  static getSelectorStub<R, S>(
    selector?: Selector<R, S>,
    comparator?: Comparator): Subject<S> {
      return MockNgRedux
        .getInstance()
        .mockRootStore
        .getSelectorStub<S>(selector, comparator);
  }

  /**
   * Returns a mock substore that allows you to set up selectorStubs for
   * any 'fractal' stores your app creates with NgRedux.configureSubStore.
   *
   * If your app creates deeply nested substores from other substores,
   * pass the chain of pathSelectors in as ordered arguments to mock
   * the nested substores out.
   * @param pathSelectors
   */
  static getSubStore<S>(...pathSelectors: PathSelector[]): MockObservableStore<S> {
    return pathSelectors.length ?
      MockNgRedux.getInstance().mockRootStore.getSubStore(...pathSelectors) :
      MockNgRedux.getInstance().mockRootStore;
  }

  /**
   * Reset all previously configured stubs.
   */
  static reset(): void {
    MockNgRedux.getInstance().mockRootStore.reset();
    NgRedux.instance = MockNgRedux.mockInstance;
  }

  /**
   * Gets the singleton MockNgRedux instance. Useful for cases where your
   * tests need to spy on store methods, for example.
   */
  static getInstance() {
    MockNgRedux.mockInstance = MockNgRedux.mockInstance || new MockNgRedux();
    return MockNgRedux.mockInstance;
  }

  provideStore = (store: Store<any>): void  => {};
  configureStore = (
    rootReducer: Reducer<any>,
    initState: any,
    middleware?: Middleware[],
    enhancers?: StoreEnhancer<any>[]): void => {};

  configureSubStore = this.mockRootStore.configureSubStore;
  select = this.mockRootStore.select;

  dispatch = this.mockRootStore.dispatch as Dispatch<any>;
  getState = this.mockRootStore.getState;
  subscribe = this.mockRootStore.subscribe;
  replaceReducer = this.mockRootStore.replaceReducer;

  /** @hidden */
  private constructor() {
    super();
    // This hooks the mock up to @select.
    NgRedux.instance = this;
  }
}
