import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 경로가 변경될 때마다 페이지 뷰 전송 (배포 환경만)
    if (import.meta.env.PROD) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
