export interface ContactInfo {
  email:        string
  phone:        string
  location:     string
  responseTime: string
  available:    boolean
  availableText: string
  socials: {
    github:   string
    linkedin: string
    twitter:  string
    facebook: string
    instagram: string
    tiktok:   string
  }
}

export interface FAQ {
  id:       string
  question: string
  answer:   string
  order:    number
}

export interface ContactData {
  info: ContactInfo
  faqs: FAQ[]
}


// // Sudhu api er jonno any error bypasss


export interface ContactApiFAQ {
  id?: string;
  _id?: string;
  question: string;
  answer: string;
  order: number;
}

export interface ContactApiData {
  info: ContactInfo;
  faqs: ContactApiFAQ[];
}
