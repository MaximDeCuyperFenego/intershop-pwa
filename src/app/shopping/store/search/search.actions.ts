import { Action } from '@ngrx/store';

import { HttpError } from 'ish-core/models/http-error/http-error.model';
import { SuggestTerm } from 'ish-core/models/suggest-term/suggest-term.model';

export enum SearchActionTypes {
  PrepareNewSearch = '[Shopping] Prepare Search For Products',
  SearchProducts = '[Shopping] Search Products',
  SearchProductsSuccess = '[Shopping] Search Products Success',
  SearchProductsFail = '[Shopping] Search Products Fail',
  SuggestSearch = '[Shopping] Suggest Search',
  SuggestSearchSuccess = '[Shopping] Suggest Search Success',
  SearchMoreProducts = '[Shopping] Search More Products',
}

export class PrepareNewSearch implements Action {
  readonly type = SearchActionTypes.PrepareNewSearch;
}

export class SearchProducts implements Action {
  readonly type = SearchActionTypes.SearchProducts;
  constructor(public payload: string) {}
}

export class SearchProductsSuccess implements Action {
  readonly type = SearchActionTypes.SearchProductsSuccess;
  constructor(public payload: string) {}
}

export class SearchProductsFail implements Action {
  readonly type = SearchActionTypes.SearchProductsFail;
  constructor(public payload: HttpError) {}
}

export class SuggestSearch implements Action {
  readonly type = SearchActionTypes.SuggestSearch;
  constructor(public payload: string) {}
}

export class SuggestSearchSuccess implements Action {
  readonly type = SearchActionTypes.SuggestSearchSuccess;
  constructor(public payload: SuggestTerm[]) {}
}

export class SearchMoreProducts implements Action {
  readonly type = SearchActionTypes.SearchMoreProducts;
  constructor(public payload: string) {}
}

export type SearchAction =
  | PrepareNewSearch
  | SearchProducts
  | SearchProductsSuccess
  | SearchProductsFail
  | SuggestSearch
  | SuggestSearchSuccess
  | SearchMoreProducts;
