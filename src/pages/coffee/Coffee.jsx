// src/pages/Coffee.jsx
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../layout/Layout';
import {
  MDBContainer, MDBRow, MDBCol,
  MDBCard, MDBCardHeader, MDBCardBody,
  MDBInput, MDBBtn, MDBIcon,
  MDBTable, MDBTableHead, MDBTableBody
} from 'mdb-react-ui-kit';
import { useTranslation } from 'react-i18next';
import api from '../../api/api';

import AsyncSearchableSelect from '../../components/common/AsyncSearchableSelect';
import useCoffeeMenu from '../../hooks/useCoffeeMenu';
import { getUserBalances } from '../../api/coffeeApi';
import swal from 'sweetalert';
import { Link } from 'react-router-dom';

export default function Coffee() {
  const { t, i18n } = useTranslation();

  const canSeeReports = true;
  const canEdit = true;

  // Load data
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const { menu, loading: menuLoading, error: menuError } = useCoffeeMenu(menuSearchTerm, i18n.language);
  //Load Images
  const [previewUrls, setPreviewUrls] = useState({});
  const imageFetchRefs = useRef({}); // For race condition guards

  // Local UI state
  const [selectedUser, setSelectedUser] = useState(null); // will hold a userId
  const [cart,         setCart]         = useState([]);


  // Filtered menu
  const filteredMenu = menu;

  // Cart manipulation
  const addToCart = product => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.menu_id === product.menu_id);
      if (idx >= 0) {
        const upd = [...prev];
        upd[idx].quantity += 1;
        return upd;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = id => {
    setCart(prev => prev.filter(i => i.menu_id !== id));
  };

  const changeQuantity = (id, delta) => {
    setCart(prev =>
      prev.map(i =>
        i.menu_id === id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );
  };

  const grandTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Your AsyncSearchableSelect loadOptions:
  const loadUserOptions = async (searchText) => {
    try {
      const users = await getUserBalances(searchText, i18n.language);
      
      return users.map(u => ({
        value: u.user_id,
        label: `${u.full_name} (Bal. ${u.balance.toFixed(2)})`,
        balance: u.balance
      }));
    } catch {
      return [];
    }
  };

  const fetchImageBlob = async (filename, menuId) => {
    const fetchId = Date.now();
    imageFetchRefs.current[menuId] = fetchId;

    try {
      const response = await api.get(`/api/coffee-menu-image/${filename}`, {
        responseType: 'blob'
      });

      if (imageFetchRefs.current[menuId] !== fetchId) return;

      const objectUrl = URL.createObjectURL(response.data);

      setPreviewUrls(prev => ({
        ...prev,
        [menuId]: objectUrl
      }));
    } catch (err) {
      console.error(`Failed to fetch image for ${menuId}:`, err);
    }
  };

  useEffect(() => {
    filteredMenu.forEach(prod => {
      if (prod.image && !previewUrls[prod.menu_id]) {
        fetchImageBlob(prod.image, prod.menu_id);
      }
    });

    return () => {
      // Revoke old URLs on unmount to avoid memory leaks
      Object.values(previewUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [filteredMenu]);


  const handleProcessSale = async () => {
    try {
      const payload = {
        userId: selectedUser?.value,
        items: cart.map(item => ({
          menuId: item.menu_id,
          quantity: item.quantity
        }))
      };

      const res = await api.post(`/api/coffee/process?lang=${i18n.language}`, payload);
      swal(res.data.title, res.data.message, res.data.type);

      if (res.data.success !== false) {
        setCart([]);            // Clear the cart
        setSelectedUser(null);  // Reset user selection
      }

    } catch (err) {
      console.error('Failed to process sale:', err);
      swal(t('error'), t('failed_to_process_sale'), 'error');
    }
  };


  // Render loading/error
  // if (menuLoading || usersLoading) {
  //   return (
  //     <Layout pageTitle={t('coffee_shop')}>
  //       <MDBContainer className="text-center py-5">
  //         <MDBIcon fas icon="spinner" spin size="3x" />
  //       </MDBContainer>
  //     </Layout>
  //   );
  // }
  if (menuError) {
    return (
      <Layout pageTitle={t('coffee_shop')}>
        <p className="text-center text-danger">
          {t('failed_to_load_data')}
        </p>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={t('coffee_shop')}>
      <MDBContainer fluid>

        {/* Top buttons */}
        <MDBRow className="mb-4 text-end">
          <MDBCol>
            {canSeeReports && (
              <>
              <Link className="btn btn-info me-2" to={'http://localhost:3000/reports?tab=coffeeSales'}>
                <MDBIcon fas icon="chart-line" className="me-1" />
                {t('sales_reports')}
              </Link>
              </>
            )}
            {canEdit && (
              <>
              <Link className="btn btn-dark me-2" to={'http://localhost:3000/menu'}>
                <MDBIcon fas icon="utensils" className="me-1" />
                {t('menu_management')}
              </Link>
              </>
            )}

            <MDBBtn color="warning">
              <MDBIcon fas icon="shopping-cart" className="me-1" />
              {t('orders')}
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        <MDBRow>
          {/* Product Catalog */}
          <MDBCol md="7">
            <MDBCard className="mb-4">
              <MDBCardHeader>
                <div className="d-flex gap-3 justify-content-between align-items-center">
                  <h5 className="mb-0 text-nowrap">
                    <MDBIcon fas icon="th-large" className="me-1" />
                    {t('product_catalog')}
                  </h5>
                  <MDBInput
                    label={t('search_products')}
                    value={menuSearchTerm}
                    onChange={e => setMenuSearchTerm(e.target.value)}
                  />
                </div>
              </MDBCardHeader>
              <MDBCardBody>
                <MDBRow>
                  {filteredMenu.length ? (
                    filteredMenu.map(prod => (
                      <MDBCol md="4" key={prod.menu_id} className="mb-3">
                        <MDBCard>
                          {/* <img
                            src={prod.image}
                            alt={prod.name}
                            className="img-fluid"
                            style={{ height: 150, objectFit: 'cover' }}
                          /> */}
                          <img
                            src={previewUrls[prod.menu_id] || 'img/coffee/placeholder.jpg'}
                            alt={prod.name}
                            className="img-fluid"
                            style={{ height: 150, objectFit: 'cover' }}
                          />
                          <MDBCardHeader className="bg-light">
                            <strong>{prod.name}</strong>
                          </MDBCardHeader>
                          <MDBCardBody className="pb-1">
														<MDBRow className="d-flex justify-content-between">
														<MDBCol className="col-auto">
															<p><strong>${prod.price.toFixed(2)}</strong></p>
														</MDBCol>
														<MDBCol className="col-auto">
															<MDBBtn size="sm" onClick={() => addToCart(prod)}>
																<MDBIcon fas icon="plus" className="me-1" /> {t('add')}
															</MDBBtn>
														</MDBCol>
														</MDBRow>
                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                    ))
                  ) : (
                    <MDBCol>
                      <p className="text-center text-muted">
                        {t('no_products_found')}
                      </p>
                    </MDBCol>
                  )}
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>

          {/* Cart & User Lookup */}
          <MDBCol md="5">
            <MDBCard className="mb-4">
              <MDBCardHeader>
                <MDBIcon fas icon="shopping-cart" className="me-2" />
                {t('cart')}
              </MDBCardHeader>
              <MDBCardBody>
                {/* Async user select */}
                <AsyncSearchableSelect
                  id="userSelect"
                  loadOptions={loadUserOptions}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  placeholder={t('search_user_by_name')}
                  disabled={false}
                />

                {/* Display balance */}
                <p className="small text-muted mt-2">
                  {t('balance')}:&nbsp;
                  {selectedUser
                    ? selectedUser.balance.toFixed(2)
                    : '--'}
                </p>

                {/* Cart table */}
                {cart.length === 0 ? (
                  <p className="mt-3">{t('no_items_in_cart')}</p>
                ) : (
                  <MDBTable responsive small className="mt-3">
                    <MDBTableHead>
                      <tr>
                        <th>{t('product')}</th>
                        <th>{t('qty')}</th>
                        <th>{t('unit_price')}</th>
                        <th>{t('total')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {cart.map(item => (
                        <tr key={item.menu_id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={previewUrls[item.menu_id] || 'img/coffee/placeholder.jpg'}
                                alt={item.name}
                                style={{ width:40, height:40, objectFit:'cover' }}
                                className="me-2 rounded img-fluid"
                              />
                              {item.name}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <MDBBtn size="sm" color="secondary" onClick={() => changeQuantity(item.menu_id, -1)}>
                                <MDBIcon fas icon="minus" />
                              </MDBBtn>
                              <span className="mx-2">{item.quantity}</span>
                              <MDBBtn size="sm" color="secondary" onClick={() => changeQuantity(item.menu_id, +1)}>
                                <MDBIcon fas icon="plus" />
                              </MDBBtn>
                            </div>
                          </td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <MDBBtn size="sm" color="danger" onClick={() => removeFromCart(item.menu_id)}>
                              <MDBIcon fas icon="trash" />
                            </MDBBtn>
                          </td>
                        </tr>
                      ))}

                      {/* Grand total */}
                      <tr>
                        <td colSpan="3" className="text-end">
                          <strong>{t('total')}</strong>
                        </td>
                        <td colSpan="2">
                          <strong>${grandTotal.toFixed(2)}</strong>
                        </td>
                      </tr>
                    </MDBTableBody>
                  </MDBTable>
                )}

                <MDBBtn
                  color="success"
                  className="mt-3"
                  block
                  onClick={handleProcessSale}
                  disabled={!cart.length || !selectedUser}
                >
                  <MDBIcon fas icon="cash-register" className="me-2" />
                  {t('process_sale')}
                </MDBBtn>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </Layout>
  );
}
