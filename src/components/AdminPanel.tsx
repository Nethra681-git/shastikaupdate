import React, { useEffect, useMemo, useState } from 'react'
import { User, ShoppingCart, Truck, Bell, DollarSign, Check, X, MessageCircle, Lock, Key } from 'lucide-react'
import { collection, doc, onSnapshot, getDoc, setDoc, updateDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import useStore from '@/lib/store'

type UserType = {
  id: string
  name: string
  email: string
  role: string
  status?: string
  [k: string]: any
}

type OrderType = {
  id: string
  product: string
  buyer: any
  total: number
  paymentStatus: string
  shipmentStage?: number
  tracking?: { number?: string; link?: string }
  [k: string]: any
}

const tabs = ['Users','Orders','Shipments','Notifications','Revenue'] as const

const glass = 'bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/6'

async function hashPin(pin: string) {
  const data = new TextEncoder().encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

export default function AdminPanel(){
  const user = useStore(s=>s.user)
  const [activeTab,setActiveTab] = useState<typeof tabs[number]>('Users')

  // Access control
  useEffect(()=>{
    if (!user) return
    if (!(user.role === 'admin' || user.isAdmin)){
      // Access denied, redirect
      setTimeout(()=> window.location.href='/', 2000)
    }
  },[user])

  // State for data
  const [users,setUsers] = useState<UserType[]>([])
  const [orders,setOrders] = useState<OrderType[]>([])
  const [notifications,setNotifications] = useState<any[]>([])

  const [filterRole,setFilterRole] = useState<'All'|'Buyers'|'Farmers'>('All')

  // PIN modals
  const [pinModalOpen,setPinModalOpen] = useState(false)
  const [pinCallback,setPinCallback] = useState<((ok:boolean)=>void)|null>(null)
  const [pinValue,setPinValue] = useState('')
  const [changePinOpen,setChangePinOpen] = useState(false)
  const [newPin,setNewPin] = useState('')
  const [confirmPin,setConfirmPin] = useState('')

  // Ship stages
  const stages = useMemo(()=>['Order Placed','Processing','Shipped','In Transit','Out for Delivery','Delivered'],[])

  // Real-time listeners
  useEffect(()=>{
    if (!db) return
    const unsubUsers = onSnapshot(collection(db,'users'), snap=>{
      const list: UserType[] = []
      snap.forEach(d=> list.push({ id: d.id, ...(d.data() as any) }))
      setUsers(list)
    })
    const unsubOrders = onSnapshot(collection(db,'orders'), snap=>{
      const list: OrderType[] = []
      snap.forEach(d=> list.push({ id: d.id, ...(d.data() as any) }))
      setOrders(list)
    })
    const unsubNotifs = onSnapshot(collection(db,'notifications'), snap=>{
      const list: any[] = []
      snap.forEach(d=> list.push({ id: d.id, ...(d.data() as any) }))
      setNotifications(list)
    })
    return ()=>{ unsubUsers(); unsubOrders(); unsubNotifs() }
  },[])

  async function openPinModal(cb: (ok:boolean)=>void){ setPinCallback(()=>cb); setPinModalOpen(true) }

  async function verifyPin(pin:string){
    try{
      const ref = doc(db,'adminConfig','pin')
      const snap = await getDoc(ref)
      if (!snap.exists()) return false
      const stored = snap.data()?.hash
      const h = await hashPin(pin)
      return stored === h
    }catch(e){ console.error(e); return false }
  }

  async function handlePinSubmit(){
    if (!pinCallback) return
    const ok = await verifyPin(pinValue)
    setPinModalOpen(false)
    setPinValue('')
    pinCallback(ok)
    setPinCallback(null)
  }

  async function handleChangePin(){
    if (newPin.length !==4 || newPin !== confirmPin){ alert('PINs must match and be 4 digits'); return }
    const h = await hashPin(newPin)
    await setDoc(doc(db,'adminConfig','pin'), { hash: h })
    alert('PIN updated')
    setChangePinOpen(false)
  }

  // Example: Approve order requires PIN
  async function approveOrder(orderId:string){
    openPinModal(async (ok)=>{
      if (!ok){ alert('Invalid PIN'); return }
      await updateDoc(doc(db,'orders',orderId), { status: 'approved' })
      // pulse animation handled by CSS class toggled via state (not shown)
    })
  }

  async function rejectOrder(orderId:string){
    openPinModal(async (ok)=>{
      if (!ok){ alert('Invalid PIN'); return }
      await updateDoc(doc(db,'orders',orderId), { status: 'rejected' })
    })
  }

  async function updateShipment(orderId:string, stage:number){
    await updateDoc(doc(db,'orders',orderId), { shipmentStage: stage })
  }

  // UI pieces
  if (!user) return <div className="p-6">Loading...</div>
  if (!(user.role==='admin' || user.isAdmin)){
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`${glass} max-w-md text-center`}>
          <Lock className="mx-auto" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-green-200 mt-2">You do not have admin privileges. Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-green-200">Manage users, orders, shipments and notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 bg-white/6 rounded" onClick={()=>setChangePinOpen(true)}><Key size={16} className="inline mr-2"/>Change PIN</button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-56 bg-gradient-to-b from-green-900 to-green-950 p-3 rounded">
          {tabs.map(t=> (
            <button key={t} onClick={()=>setActiveTab(t)} className={`w-full text-left px-3 py-2 rounded my-1 ${activeTab===t? 'bg-green-700 text-white':'text-green-200 hover:bg-green-800/40'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <div className={`${glass} animate-fade-in`}> 
            {/* Tab content */}
            {activeTab==='Users' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User />
                    <h2 className="font-bold">Users</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={filterRole} onChange={e=>setFilterRole(e.target.value as any)} className="bg-white/5 px-3 py-2 rounded">
                      <option>All</option>
                      <option>Buyers</option>
                      <option>Farmers</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  {users.filter(u=> filterRole==='All' ? true : (filterRole==='Buyers'? u.role==='buyer' : u.role==='farmer')).map(u=> (
                    <div key={u.id} className="flex items-center justify-between p-3 bg-white/3 rounded">
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-sm text-green-200">{u.email} • {u.role}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 bg-green-600 rounded" title="Approve" onClick={()=>{ /* approve */ updateDoc(doc(db,'users',u.id),{status:'approved'}) }}><Check size={14}/></button>
                        <button className="px-2 py-1 bg-red-600 rounded" title="Reject" onClick={()=>{ updateDoc(doc(db,'users',u.id),{status:'rejected'}) }}><X size={14}/></button>
                        <button className="px-2 py-1 bg-yellow-600 rounded" title="Disable" onClick={()=>{ updateDoc(doc(db,'users',u.id),{status:'disabled'}) }}>🚫</button>
                        <button className="px-2 py-1 bg-blue-600 rounded" title="Message"><MessageCircle size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==='Orders' && (
              <div>
                <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><ShoppingCart/><h2 className="font-bold">Orders</h2></div></div>
                <div className="space-y-3">
                  {orders.map(o=> (
                    <div key={o.id} className="p-3 bg-white/3 rounded">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold">{o.product}</div>
                          <div className="text-sm text-green-200">Buyer: {o.buyer?.name} • {o.buyer?.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹ {o.total}</div>
                          <div className="text-sm text-green-200">{o.paymentStatus}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button className="px-3 py-1 bg-green-600 rounded" onClick={()=>approveOrder(o.id)}>Approve</button>
                        <button className="px-3 py-1 bg-red-600 rounded" onClick={()=>rejectOrder(o.id)}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==='Shipments' && (
              <div>
                <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Truck/><h2 className="font-bold">Shipments</h2></div></div>
                <div className="space-y-3">
                  {orders.map(o=> (
                    <div key={o.id} className="p-3 bg-white/3 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{o.product}</div>
                          <div className="text-sm text-green-200">Stage: { (o.shipmentStage ?? 0) + 1 } / {stages.length}</div>
                        </div>
                        <div className="w-1/3">
                          <div className="h-2 bg-white/10 rounded overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${((o.shipmentStage ?? 0)+1)/stages.length*100}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        {Array.from({length:stages.length}).map((_,i)=> (
                          <button key={i} disabled={(o.shipmentStage ?? 0) < i} className={`px-2 py-1 rounded ${ (o.shipmentStage ?? 0) >= i ? 'bg-green-600' : 'bg-white/6' }`} onClick={()=>updateShipment(o.id,i)}>{stages[i]}</button>
                        ))}
                      </div>
                      <div className="mt-3">
                        <label className="text-sm text-green-200">Tracking Number</label>
                        <input className="w-full mt-1 p-2 rounded bg-white/5" defaultValue={o.tracking?.number || ''} onBlur={e=> updateDoc(doc(db,'orders',o.id), { tracking: { ...(o.tracking||{}), number: e.currentTarget.value } })} />
                        <label className="text-sm text-green-200 mt-2">Tracking Link</label>
                        <input className="w-full mt-1 p-2 rounded bg-white/5" defaultValue={o.tracking?.link || ''} onBlur={e=> updateDoc(doc(db,'orders',o.id), { tracking: { ...(o.tracking||{}), link: e.currentTarget.value } })} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==='Notifications' && (
              <div>
                <div className="flex items-center gap-2 mb-4"><Bell/><h2 className="font-bold">Notifications</h2></div>
                <div className="space-y-2">
                  {notifications.map(n=> (
                    <div key={n.id} className="p-3 bg-white/3 rounded"><div className="font-semibold">{n.title}</div><div className="text-sm text-green-200">{n.message}</div><div className="text-xs text-green-300">{new Date(n.createdAt?.toDate?.() || n.createdAt || Date.now()).toLocaleString()}</div></div>
                  ))}
                </div>
              </div>
            )}

            {activeTab==='Revenue' && (
              <div><div className="flex items-center gap-2"><DollarSign/><h2 className="font-bold">Revenue</h2></div><div className="p-6 text-center text-green-200">Revenue section coming soon...</div></div>
            )}
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className={`${glass} max-w-sm`}>
            <h3 className="font-bold">Enter Admin PIN</h3>
            <input type="password" maxLength={4} value={pinValue} onChange={e=>setPinValue(e.target.value.replace(/[^0-9]/g,''))} className="w-full mt-3 p-2 rounded bg-white/5 text-xl text-center" />
            <div className="mt-4 flex justify-end gap-2"><button onClick={()=>{ setPinModalOpen(false); setPinValue('') }} className="px-3 py-1 rounded bg-white/6">Cancel</button><button onClick={handlePinSubmit} className="px-3 py-1 rounded bg-green-600">Verify</button></div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {changePinOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className={`${glass} max-w-sm`}>
            <h3 className="font-bold">Change Admin PIN</h3>
            <input type="password" placeholder="New 4-digit PIN" maxLength={4} value={newPin} onChange={e=>setNewPin(e.target.value.replace(/[^0-9]/g,''))} className="w-full mt-3 p-2 rounded bg-white/5" />
            <input type="password" placeholder="Confirm PIN" maxLength={4} value={confirmPin} onChange={e=>setConfirmPin(e.target.value.replace(/[^0-9]/g,''))} className="w-full mt-2 p-2 rounded bg-white/5" />
            <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setChangePinOpen(false)} className="px-3 py-1 rounded bg-white/6">Cancel</button><button onClick={handleChangePin} className="px-3 py-1 rounded bg-green-600">Save</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
