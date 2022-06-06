import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'My Drive',
    icon: 'hard-drive-outline',
    link: '/pages/my-drive',
    home: true,
    expanded: true,
    children: [
      {
        title: 'Private',
        icon: 'lock-outline',
        link: '/pages/my-drive',
      },
      {
        title: 'Public',
        icon: 'unlock-outline',
        link: '/pages/my-drive/public',
      },
    ],
  },
  {
    title: 'Shared with me',
    icon: 'people-outline',
    link: '/pages/my-drive/shared',
  },
];
