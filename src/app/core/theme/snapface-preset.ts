import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const SnapFacePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '#00D4FF',
      500: '#00B8E6',
      600: '#0099CC',
      700: '#0077A3',
      800: '#005580',
      900: '#003D5C',
      950: '#002233',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        primary: {
          color: '#0099CC',
          contrastColor: '#ffffff',
          hoverColor: '#00B8E6',
          activeColor: '#0077A3',
        },
      },
      dark: {
        dark: {
          surface: {
            0: '#ffffff',
            50: '{slate.50}',
            100: '{slate.100}',
            200: '{slate.200}',
            300: '{slate.300}',
            400: '{slate.400}',
            500: '{slate.500}',
            600: '{slate.600}',
            700: '{slate.700}',
            800: '#111827',
            900: '#0a0e1a',
            950: '#050810',
          },
          primary: {
            color: '#00D4FF',
            contrastColor: '#0a0e1a',
            hoverColor: '#33DDFF',
            activeColor: '#00B8E6',
          },
        },
      },
    },
  },
});
