import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { createImagePageletView } from 'ish-core/models/content-view/content-image-view';
import { createSimplePageletView } from 'ish-core/models/content-view/content-views';
import { STATIC_URL } from 'ish-core/services/state-transfer/factories';
import { PipesModule } from '../../../shared/pipes.module';

import { CMSImageEnhancedComponent } from './cms-image-enhanced.component';

describe('Cms Image Enhanced Component', () => {
  let component: CMSImageEnhancedComponent;
  let fixture: ComponentFixture<CMSImageEnhancedComponent>;
  let element: HTMLElement;
  const BASE_URL = 'http://www.example.org';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CMSImageEnhancedComponent],
      imports: [PipesModule, RouterTestingModule],
      providers: [{ provide: STATIC_URL, useValue: BASE_URL }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CMSImageEnhancedComponent);
    component = fixture.componentInstance;
    const pagelet = {
      definitionQualifiedName: 'fq',
      id: 'id',
      configurationParameters: {
        Image: 'foo:bar.png',
      },
    };
    component.pagelet = createImagePageletView(createSimplePageletView(pagelet));
    element = fixture.nativeElement;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(element).toBeTruthy();
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
