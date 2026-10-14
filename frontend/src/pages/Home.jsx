import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentCustomer } from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchCustomer = async () => {
      try {
        const res = await getCurrentCustomer();
        if (isMounted) {
          setCustomer(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          navigate("/login", { replace: true });
        }
      }
    };

    fetchCustomer();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="home">
      <Navbar customerName={customer?.fullName?.split(" ")[0]} />

      <main className="home__content">
        <section className="home__welcome">
          <p className="dash-eyebrow">Welcome back</p>
          <h1 className="home__title">Hey, {customer?.fullName}</h1>
          <p className="home__sub">Good to see you again on ShopKart.</p>
          <Link to="/products" className="btn btn--primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Browse products
          </Link>
        </section>

        <section className="card">
          <h3 className="card__title">Your details</h3>
          <dl className="dl">
            <div className="dl__row">
              <dt>Full name</dt>
              <dd>{customer?.fullName}</dd>
            </div>
            <div className="dl__row">
              <dt>Email</dt>
              <dd>{customer?.email}</dd>
            </div>
            <div className="dl__row">
              <dt>Phone</dt>
              <dd>{customer?.phone}</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}

export default Home;
