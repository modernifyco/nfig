import { Adapter } from 'nfig-common';

export type NfigOptions = {
  adapter: Adapter;
};

export class Nfig {
  constructor({ adapter }: NfigOptions) {}
}
