import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import SiteFooter from './SiteFooter';

describe('site footer', () => {
  it('uses real public routes and the operational admin mailbox', () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Product' }).getAttribute('href')).toBe('/product');
    expect(screen.getByRole('link', { name: 'Experience' }).getAttribute('href')).toBe('/experience');
    expect(screen.getByRole('link', { name: 'Reliability' }).getAttribute('href')).toBe('/reliability');
    expect(screen.getByRole('link', { name: 'Security' }).getAttribute('href')).toBe('/security');
    expect(screen.getByRole('link', { name: 'Contact' }).getAttribute('href')).toBe('/contact');
    expect(screen.getByRole('link', { name: 'Downloads' }).getAttribute('href')).toBe('/downloads');
    expect(
      screen.getByRole('link', { name: 'Email: admin@signalbridges.com' }).getAttribute('href'),
    ).toBe('mailto:admin@signalbridges.com');
    expect(screen.getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy');
    expect(screen.getByRole('link', { name: 'Terms' }).getAttribute('href')).toBe('/tos');
  });
});

