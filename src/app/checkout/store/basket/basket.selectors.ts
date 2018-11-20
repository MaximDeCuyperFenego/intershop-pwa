import { createSelector } from '@ngrx/store';

import { BasketHelper, BasketView } from 'ish-core/models/basket/basket.model';
import { getProductEntities } from '../../../shopping/store/products';
import { getCheckoutState } from '../checkout.state';

const getBasketState = createSelector(getCheckoutState, state => state.basket);

/**
 * Select the current basket with the appended product data for each line item.
 */
export const getCurrentBasket = createSelector(
  getBasketState,
  getProductEntities,
  (basket, products): BasketView =>
    !basket.basket
      ? undefined
      : {
          ...basket.basket,
          lineItems: basket.lineItems.map(li => ({
            ...li,
            product: products[li.productSKU],
          })),
          itemsCount: BasketHelper.getBasketItemsCount(basket.lineItems),
          payment: basket.payments[0],
        }
);

export const getBasketLoading = createSelector(getBasketState, basket => basket.loading);

export const getBasketError = createSelector(getBasketState, basket => basket.error);

export const getBasketEligibleShippingMethods = createSelector(
  getBasketState,
  basket => basket.eligibleShippingMethods
);

export const getBasketEligiblePaymentMethods = createSelector(getBasketState, basket => basket.eligiblePaymentMethods);
