import { PropsWithChildren } from 'react';
import { makeStyles } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import ExtensionIcon from '@material-ui/icons/Extension';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import CreateComponentIcon from '@material-ui/icons/AddCircleOutline';
import CloudIcon from '@material-ui/icons/Cloud';
import MonitoringIcon from '@material-ui/icons/Timeline';
import SecurityIcon from '@material-ui/icons/Security';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import GitHubIcon from '@material-ui/icons/GitHub';
import DashboardIcon from '@material-ui/icons/Dashboard';
import RouteIcon from '@material-ui/icons/Route';
import RadarIcon from '@material-ui/icons/Radar';
import LogoFull from './LogoFull';
import LogoIcon from './LogoIcon';
import {
  Settings as SidebarSettings,
  UserSettingsSignInAvatar,
} from '@backstage/plugin-user-settings';
import { SidebarSearchModal } from '@backstage/plugin-search';
import {
  Sidebar,
  sidebarConfig,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarPage,
  SidebarScrollWrapper,
  SidebarSpace,
  useSidebarOpenState,
  Link,
} from '@backstage/core-components';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { MyGroupsSidebarItem } from '@backstage/plugin-org';
import GroupIcon from '@material-ui/icons/People';
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';

const useSidebarLogoStyles = makeStyles({
  root: {
    width: sidebarConfig.drawerWidthClosed,
    height: 3 * sidebarConfig.logoHeight,
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    marginBottom: -14,
  },
  link: {
    width: sidebarConfig.drawerWidthClosed,
    marginLeft: 24,
  },
});

const SidebarLogo = () => {
  const classes = useSidebarLogoStyles();
  const { isOpen } = useSidebarOpenState();

  return (
    <div className={classes.root}>
      <Link to="/" underline="none" className={classes.link} aria-label="Home">
        {isOpen ? <LogoFull /> : <LogoIcon />}
      </Link>
    </div>
  );
};

export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="DevOpsCanvas" icon={<DashboardIcon />}>
        {/* DevOpsCanvas-specific navigation */}
        <SidebarItem icon={DashboardIcon} to="devopscanvas-dashboard" text="Platform Dashboard" />
        <SidebarItem icon={RouteIcon} to="golden-paths" text="Golden Paths" />
        <SidebarItem icon={RadarIcon} to="tech-radar" text="Tech Radar" />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Developer Tools" icon={<MenuIcon />}>
        {/* Standard Backstage navigation */}
        <SidebarItem icon={HomeIcon} to="catalog" text="Service Catalog" />
        <SidebarItem icon={CreateComponentIcon} to="create" text="Create Service" />
        <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
        <SidebarItem icon={LibraryBooks} to="docs" text="Documentation" />
        <MyGroupsSidebarItem
          singularTitle="My Team"
          pluralTitle="My Teams"
          icon={GroupIcon}
        />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Platform Services" icon={<CloudIcon />}>
        <SidebarItem 
          icon={GitHubIcon} 
          to="https://github.com/DevOpsCanvasIO" 
          text="GitOps" 
        />
        <SidebarItem 
          icon={MonitoringIcon} 
          to="https://grafana.devopscanvas.io" 
          text="Observability" 
        />
        <SidebarItem 
          icon={SecurityIcon} 
          to="/catalog?filters%5Bkind%5D=component&filters%5Bspec.type%5D=security" 
          text="Security" 
        />
        <SidebarItem 
          icon={AccountBalanceIcon} 
          to="/catalog?filters%5Bkind%5D=component&filters%5Bspec.type%5D=finops" 
          text="FinOps" 
        />
      </SidebarGroup>
        <SidebarDivider />
        <SidebarScrollWrapper>
          {/* Items in this group will be scrollable if they run out of space */}
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <NotificationsSidebarItem />
      <SidebarDivider />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);