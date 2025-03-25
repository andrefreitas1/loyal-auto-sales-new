export interface Translation {
  home: {
    hero: {
      title: string;
      description: string;
      historyButton: string;
      valuesButton: string;
    };
    history: {
      title: string;
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    };
    values: {
      title: string;
      subtitle: string;
      values: Array<{
        title: string;
        description: string;
        icon: string;
      }>;
    };
    featuredVehicles: {
      title: string;
      year: string;
      color: string;
      mileage: string;
      price: string;
      contactButton: string;
    };
  };
  contact: {
    title: string;
    description: string;
    form: {
      vehicleInterest: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      message: string;
      submit: string;
      success: string;
      sending: string;
    };
  };
  navbar: {
    home: string;
    history: string;
    values: string;
    featuredVehicles: string;
    contact: string;
    dashboard: string;
    logout: string;
    employers: string;
  };
  values: {
    transparency: {
      icon: string;
      title: string;
      description: string;
    };
    trust: {
      icon: string;
      title: string;
      description: string;
    };
    excellence: {
      icon: string;
      title: string;
      description: string;
    };
    commitment: {
      icon: string;
      title: string;
      description: string;
    };
    innovation: {
      icon: string;
      title: string;
      description: string;
    };
    respect: {
      icon: string;
      title: string;
      description: string;
    };
  };
}

export interface Navbar {
  home: string;
  history: string;
  values: string;
  featuredVehicles: string;
  contact: string;
  dashboard: string;
  logout: string;
  employers: string;
} 