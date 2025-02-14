import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { uniq } from 'lodash-es';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CheckoutFacade } from 'ish-core/facades/checkout.facade';
import { BasketFeedback } from 'ish-core/models/basket-feedback/basket-feedback.model';
import { BasketValidationResultType } from 'ish-core/models/basket-validation/basket-validation.model';
import { LineItemView } from 'ish-core/models/line-item/line-item.model';
import { PriceItem } from 'ish-core/models/price-item/price-item.model';

/**
 * Displays the basket validation result messages. In case of basket adjustments removed or undeliverable items are
 *
 * @example
 * <ish-basket-validation-results></ish-basket-validation-results>
 */
@Component({
  selector: 'ish-basket-validation-results',
  templateUrl: './basket-validation-results.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class BasketValidationResultsComponent implements OnInit {
  validationResults$: Observable<BasketValidationResultType>;

  hasGeneralBasketError$: Observable<boolean>;
  errorMessages$: Observable<string[]>;
  infoMessages$: Observable<string[]>;
  undeliverableItems$: Observable<LineItemView[]>;
  removedItems$: Observable<{ message: string; productSKU: string; price: PriceItem }[]>;

  itemHasBeenRemoved = false;

  // default values to control scrolling behavior
  scrollDuration = 500;
  scrollSpacing = 64;

  private destroyRef = inject(DestroyRef);

  constructor(private checkoutFacade: CheckoutFacade) {}

  @Output() continueCheckout = new EventEmitter<void>();

  ngOnInit() {
    this.validationResults$ = this.checkoutFacade.basketValidationResults$;

    // update emitted to display spinning animation
    this.validationResults$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.itemHasBeenRemoved) {
        this.continueCheckout.emit();
        this.itemHasBeenRemoved = false;
      }
    });

    this.hasGeneralBasketError$ = this.validationResults$.pipe(
      map(results => results?.errors?.some(error => this.isLineItemMessage(error)))
    );

    this.errorMessages$ = this.validationResults$.pipe(
      map(results =>
        uniq(
          results?.errors
            ?.filter(
              error =>
                !this.isLineItemMessage(error) &&
                ![
                  'basket.validation.line_item_shipping_restrictions.error',
                  'basket.validation.basket_not_covered.error',
                ].includes(error.code)
            )
            .map(error =>
              error.parameters?.shippingRestriction ? error.parameters.shippingRestriction : error.message
            )
        ).filter(message => !!message)
      )
    );

    this.undeliverableItems$ = this.validationResults$.pipe(
      map(results =>
        results?.errors
          ?.filter(error => error.code === 'basket.validation.line_item_shipping_restrictions.error' && error.lineItem)
          .map(error => ({ ...error.lineItem }))
      )
    );

    this.removedItems$ = this.validationResults$.pipe(
      map(results =>
        results?.infos
          ?.map(info => ({
            message: info.message,
            productSKU: info.parameters?.productSku,
            price: info.lineItem?.price,
          }))
          .filter(info => !!info.productSKU)
      )
    );

    this.infoMessages$ = this.validationResults$.pipe(
      map(results => uniq(results?.infos?.map(info => info.message)).filter(message => !!message))
    );
  }

  isLineItemMessage(error: BasketFeedback): boolean {
    return !!(
      error.parameters &&
      error.code !== 'basket.validation.line_item_shipping_restrictions.error' &&
      error.parameters.scopes &&
      (error.parameters.scopes.includes('Addresses') || error.parameters.scopes.includes('Products')) &&
      error.parameters.lineItemId
    );
  }

  deleteItem(itemId: string) {
    this.checkoutFacade.deleteBasketItem(itemId);
    this.itemHasBeenRemoved = true;
  }
}
